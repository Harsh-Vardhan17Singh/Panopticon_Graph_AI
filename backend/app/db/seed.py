from app.db.session import SessionLocal
from app.db.init_db import create_tables

import app.models

from app.models.organization import Organization
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device

def seed_database():
    create_tables()
    db = SessionLocal()

    try:
        #check whether development data already exists
        existing_organization = db.query(Organization).first()

        if existing_organization:
            print("Development data already exists.")
            return

        #Creating Organization

        organization = Organization(
            name="Panopticon Demo Bank",
            industry="Financial Services",
            country = "india"
        )

        db.add(organization)
        db.flush()

        #Create account

        account = Account(
            account_number="PAN-ACC-0001",
            account_type="SAVINGS",
            balance=150000.00,
            status="ACTIVE",
            organization_id=organization.id,
        )

        #Create merchant 
        merchant = Merchant(
            merchant_name="Demo Electronics Store",
            category="Electronics",
            city="New Delhi",
            country="india",
        )

        #Create Device

        device = Device(
            device_id="DEVICE-DEMO-001",
            device_type="Mobile",
            operating_system="Android",
            ip_address="192.168.1.100",
        )

        db.add(account)
        db.add(merchant)
        db.add(device)

        db.commit()

        print("Development data created successfully.")
        print(f"Organization ID: {organization.id}")
        print(f"Account ID : {account.id}")
        print(f"Merchant ID: { merchant.id}")
        print(f"Device ID : {device.id}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()