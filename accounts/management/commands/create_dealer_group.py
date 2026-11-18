from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create the CarCraft Dealer group"

    def handle(self, *args, **options):
        group, created = Group.objects.get_or_create(
            name="Dealer"
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    "Dealer group created successfully."
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "Dealer group already exists."
                )
            )