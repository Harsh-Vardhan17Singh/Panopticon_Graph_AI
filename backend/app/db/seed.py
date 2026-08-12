from app.db.session import SessionLocal
from app.models.organization import Organization
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device

def seed_database():
    db = SessionalLocal()

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