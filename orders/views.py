from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render

from store.models import Product

from .models import Cart, CartItem, Order, OrderItem


@login_required
def orders_home(request):
    return redirect("orders:my_orders")


@login_required
def cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)

    items = cart.items.select_related("product").all()

    total = sum(
        item.product.price * item.quantity
        for item in items
    )

    return render(
        request,
        "orders/cart.html",
        {
            "cart": cart,
            "items": items,
            "total": total,
        },
    )


@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    cart, created = Cart.objects.get_or_create(
        user=request.user
    )

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
    )

    if not created:
        item.quantity += 1

    item.save()

    return redirect("orders:cart")


@login_required
def update_cart(request, item_id):
    item = get_object_or_404(
        CartItem,
        id=item_id,
        cart__user=request.user,
    )

    if request.method == "POST":
        quantity = request.POST.get("quantity", "1")

        try:
            quantity = int(quantity)
        except ValueError:
            quantity = 1

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

    return redirect("orders:cart")


@login_required
def remove_from_cart(request, item_id):
    item = get_object_or_404(
        CartItem,
        id=item_id,
        cart__user=request.user,
    )

    if request.method == "POST":
        item.delete()

    return redirect("orders:cart")


@login_required
def checkout(request):
    cart = get_object_or_404(
        Cart,
        user=request.user,
    )

    items = cart.items.select_related("product").all()

    if not items.exists():
        return redirect("orders:cart")

    total = sum(
        item.product.price * item.quantity
        for item in items
    )

    if request.method == "POST":
        shipping_address = request.POST.get(
            "shipping_address",
            "",
        ).strip()

        if not shipping_address:
            return render(
                request,
                "orders/checkout.html",
                {
                    "cart": cart,
                    "items": items,
                    "total": total,
                    "error": "Shipping address is required.",
                },
            )

        with transaction.atomic():
            for item in items.select_for_update():
                product = Product.objects.select_for_update().get(
                    id=item.product.id
                )

                if product.stock_quantity < item.quantity:
                    return render(
                        request,
                        "orders/checkout.html",
                        {
                            "cart": cart,
                            "items": items,
                            "total": total,
                            "error": (
                                f"Insufficient stock for "
                                f"{product.name}."
                            ),
                        },
                    )

            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                shipping_address=shipping_address,
                status="PENDING",
            )

            for item in items.select_related("product"):
                product = Product.objects.select_for_update().get(
                    id=item.product.id
                )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    price=product.price,
                )

                product.stock_quantity -= item.quantity

                product.save(
                    update_fields=["stock_quantity"]
                )

            cart.items.all().delete()

        return redirect(
            "orders:order_confirmation",
            order_id=order.id,
        )

    return render(
        request,
        "orders/checkout.html",
        {
            "cart": cart,
            "items": items,
            "total": total,
        },
    )


@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(
        Order.objects.prefetch_related("items__product"),
        id=order_id,
        user=request.user,
    )

    return render(
        request,
        "orders/order_confirmation.html",
        {
            "order": order,
        },
    )


@login_required
def order_detail(request, order_id):
    order = get_object_or_404(
        Order.objects.prefetch_related("items__product"),
        id=order_id,
        user=request.user,
    )

    return render(
        request,
        "orders/order_detail.html",
        {
            "order": order,
        },
    )


@login_required
def my_orders(request):
    orders = Order.objects.filter(
        user=request.user
    ).order_by("-created_at")

    return render(
        request,
        "orders/my_orders.html",
        {
            "orders": orders,
        },
    )