from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .models import Category, Product
from orders.models import Cart, CartItem


def store_home(request):
    products = (
        Product.objects
        .filter(is_active=True)
        .select_related("category")
    )

    categories = Category.objects.all()

    search = request.GET.get("search", "").strip()
    category_name = request.GET.get("category", "").strip()

    if search:
        products = products.filter(
            Q(name__icontains=search)
            | Q(sku__icontains=search)
            | Q(description__icontains=search)
        )

    if category_name:
        products = products.filter(
            category__name__iexact=category_name
        )

    context = {
        "products": products,
        "categories": categories,
        "search": search,
        "selected_category": category_name,
    }

    return render(
        request,
        "store/home.html",
        context,
    )


def product_detail(request, product_id):
    product = get_object_or_404(
        Product.objects.select_related("category"),
        id=product_id,
        is_active=True,
    )

    return render(
        request,
        "store/product_detail.html",
        {
            "product": product,
        },
    )


@login_required
def add_to_cart(request, product_id):
    if request.method != "POST":
        return redirect("store_home")

    product = get_object_or_404(
        Product,
        id=product_id,
        is_active=True,
    )

    try:
        quantity = int(
            request.POST.get("quantity", 1)
        )
    except (TypeError, ValueError):
        quantity = 1

    if quantity < 1:
        quantity = 1

    if quantity > product.stock_quantity:
        quantity = product.stock_quantity

    if quantity == 0:
        return redirect(
            "product_detail",
            product_id=product.id,
        )

    cart, created = Cart.objects.get_or_create(
        user=request.user
    )

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={
            "quantity": quantity,
        },
    )

    if not created:

        new_quantity = (
            cart_item.quantity + quantity
        )

        if new_quantity > product.stock_quantity:
            new_quantity = product.stock_quantity

        cart_item.quantity = new_quantity
        cart_item.save()

    return redirect("cart")


@login_required
def cart(request):
    cart, created = Cart.objects.get_or_create(
        user=request.user
    )

    items = (
        cart.items
        .select_related(
            "product",
            "product__category",
        )
    )

    total = sum(
        (
            item.product.price * item.quantity
            for item in items
        ),
        0,
    )

    return render(
        request,
        "store/cart.html",
        {
            "cart": cart,
            "items": items,
            "total": total,
        },
    )


@login_required
def update_cart(request, item_id):
    if request.method != "POST":
        return redirect("cart")

    cart = get_object_or_404(
        Cart,
        user=request.user,
    )

    item = get_object_or_404(
        CartItem,
        id=item_id,
        cart=cart,
    )

    try:
        quantity = int(
            request.POST.get("quantity", 1)
        )
    except (TypeError, ValueError):
        quantity = 1

    if quantity <= 0:
        item.delete()

    else:

        if quantity > item.product.stock_quantity:
            quantity = item.product.stock_quantity

        if quantity == 0:
            item.delete()

        else:
            item.quantity = quantity
            item.save()

    return redirect("cart")


@login_required
def remove_from_cart(request, item_id):
    if request.method != "POST":
        return redirect("cart")

    cart = get_object_or_404(
        Cart,
        user=request.user,
    )

    item = get_object_or_404(
        CartItem,
        id=item_id,
        cart=cart,
    )

    item.delete()

    return redirect("cart")