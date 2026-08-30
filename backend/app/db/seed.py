from app.db.session import SessionLocal
from app.db.init_db import create_tables

import app.models

from app.core.security import hash_password
from app.models.organization import Organization
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device
from app.models.user import User


def seed_database():
    """
    Create development data if it does not already exist.
    """

    create_tables()
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # ORGANIZATION
        # -------------------------------------------------
        organization = (
            db.query(Organization)
            .filter(
                Organization.name == "Panopticon Demo Bank"
            )
            .first()
        )

        if organization is None:
            organization = Organization(
                name="Panopticon Demo Bank",
                industry="Financial Services",
                country="India",
            )

            db.add(organization)
            db.flush()

            print("Organization created.")
        else:
            print("Organization already exists.")

        # -------------------------------------------------
        # ACCOUNT
        # -------------------------------------------------
        account = (
            db.query(Account)
            .filter(
                Account.account_number == "PAN-ACC-0001"
            )
            .first()
        )

        if account is None:
            account = Account(
                account_number="PAN-ACC-0001",
                account_type="SAVINGS",
                balance=150000.00,
                status="ACTIVE",
                organization_id=organization.id,
            )

            db.add(account)
            print("Account created.")
        else:
            print("Account already exists.")

        # -------------------------------------------------
        # MERCHANT
        # -------------------------------------------------
        merchant = (
            db.query(Merchant)
            .filter(
                Merchant.merchant_name
                == "Demo Electronics Store"
            )
            .first()
        )

        if merchant is None:
            merchant = Merchant(
                merchant_name="Demo Electronics Store",
                category="Electronics",
                city="New Delhi",
                country="India",
            )

            db.add(merchant)
            print("Merchant created.")
        else:
            print("Merchant already exists.")

        # -------------------------------------------------
        # DEVICE
        # -------------------------------------------------
        device = (
            db.query(Device)
            .filter(
                Device.device_id == "DEVICE-DEMO-001"
            )
            .first()
        )

        if device is None:
            device = Device(
                device_id="DEVICE-DEMO-001",
                device_type="Mobile",
                operating_system="Android",
                ip_address="192.168.1.100",
            )

            db.add(device)
            print("Device created.")
        else:
            print("Device already exists.")

        # -------------------------------------------------
        # ADMIN USER
        # -------------------------------------------------
        admin = (
            db.query(User)
            .filter(
                User.email == "admin@panopticon.com"
            )
            .first()
        )

        if admin is None:
            admin = User(
                full_name="Panopticon Admin",
                email="admin@panopticon.com",
                password=hash_password("Admin@123"),
                role="admin",
                organization_id=organization.id,
            )

            db.add(admin)
            print("Admin user created.")
        else:
            admin.password = hash_password("Admin@123")
            admin.role = "admin"
            admin.organization_id = organization.id
            print("Admin user already exists.")
            
        db.commit()

        print("\nDevelopment database setup completed.")
        print(f"Organization ID: {organization.id}")
        print(f"Account ID: {account.id}")
        print(f"Merchant ID: {merchant.id}")
        print(f"Device ID: {device.id}")
        print("Admin Email: admin@panopticon.com")
        print("Admin Password: Admin@123")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()