import csv
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from vehicle_data.models import VehicleDataset


class Command(BaseCommand):
    help = "Import the CarCraft synthetic vehicle dataset"

    def handle(self, *args, **options):
        csv_path = os.path.join(
            settings.BASE_DIR,
            "dataset",
            "carcraft_synthetic_dataset.csv"
        )

        if not os.path.exists(csv_path):
            self.stdout.write(
                self.style.ERROR(
                    f"Dataset file not found: {csv_path}"
                )
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"Reading dataset from: {csv_path}"
            )
        )

        batch = []
        batch_size = 2000

        imported = 0
        skipped = 0

        existing_ids = set(
            VehicleDataset.objects.values_list(
                "vehicle_id",
                flat=True
            )
        )

        self.stdout.write(
            f"Existing dataset records: {len(existing_ids)}"
        )

        with open(
            csv_path,
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                try:
                    vehicle_id = int(row["vehicle_id"])

                    if vehicle_id in existing_ids:
                        skipped += 1
                        continue

                    def get_int(field):
                        value = row.get(field, "").strip()

                        if not value:
                            return None

                        return int(float(value))

                    def get_decimal(field):
                        value = row.get(field, "").strip()

                        if not value:
                            return None

                        return value

                    vehicle = VehicleDataset(
                        vehicle_id=vehicle_id,
                        brand=row.get("brand", "").strip(),
                        model_name=row.get("model_name", "").strip(),
                        model_variant=row.get("model_variant", "").strip(),
                        car_type=row.get("car_type", "").strip(),
                        fuel_type=row.get("fuel_type", "").strip(),
                        transmission=row.get("transmission", "").strip(),
                        year=get_int("year"),
                        kilometers=get_int("kilometers"),
                        owner=row.get("owner", "").strip(),
                        state=row.get("state", "").strip(),
                        accidental=row.get("accidental", "").strip(),
                        price=get_decimal("price"),
                        engine_cc=get_int("engine_cc"),
                        mileage_kmpl=get_decimal("mileage_kmpl"),
                        seating_capacity=get_int("seating_capacity"),
                    )

                    batch.append(vehicle)
                    existing_ids.add(vehicle_id)

                    if len(batch) >= batch_size:
                        VehicleDataset.objects.bulk_create(
                            batch,
                            batch_size=batch_size
                        )

                        imported += len(batch)

                        self.stdout.write(
                            f"Imported {imported} records..."
                        )

                        batch = []

                except (ValueError, TypeError, KeyError) as error:
                    skipped += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped invalid row: {error}"
                        )
                    )

        if batch:
            VehicleDataset.objects.bulk_create(
                batch,
                batch_size=batch_size
            )

            imported += len(batch)

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Dataset import completed."
            )
        )

        self.stdout.write(
            f"Imported: {imported}"
        )

        self.stdout.write(
            f"Skipped: {skipped}"
        )

        self.stdout.write(
            f"Total records now: {VehicleDataset.objects.count()}"
        )