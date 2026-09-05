from datetime import datetime, timedelta

from app.db.session import SessionLocal
from app.db.init_db import create_tables

import app.models

from app.core.security import hash_password

from app.models.organization import Organization
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device
from app.models.user import User
from app.models.transaction import Transaction


def seed_database():
    """
    Create development/demo data for Panopticon.

    The seed is idempotent:
    running it multiple times will not create duplicate
    accounts, merchants, devices, or transactions.
    """

    create_tables()

    db = SessionLocal()

    try:

        # ============================================================
        # ORGANIZATION
        # ============================================================

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

        # ============================================================
        # ACCOUNTS
        # ============================================================

        accounts_data = [
            {
                "account_number": "PAN-ACC-0001",
                "account_type": "SAVINGS",
                "balance": 150000.00,
                "status": "ACTIVE",
            },
            {
                "account_number": "PAN-ACC-0002",
                "account_type": "SAVINGS",
                "balance": 87500.00,
                "status": "ACTIVE",
            },
            {
                "account_number": "PAN-ACC-0003",
                "account_type": "CURRENT",
                "balance": 420000.00,
                "status": "ACTIVE",
            },
            {
                "account_number": "PAN-ACC-0004",
                "account_type": "SAVINGS",
                "balance": 63500.00,
                "status": "ACTIVE",
            },
        ]

        accounts = {}

        for data in accounts_data:

            account = (
                db.query(Account)
                .filter(
                    Account.account_number
                    == data["account_number"]
                )
                .first()
            )

            if account is None:

                account = Account(
                    account_number=data["account_number"],
                    account_type=data["account_type"],
                    balance=data["balance"],
                    status=data["status"],
                    organization_id=organization.id,
                )

                db.add(account)
                db.flush()

                print(
                    f"Account created: "
                    f"{data['account_number']}"
                )

            else:
                print(
                    f"Account exists: "
                    f"{data['account_number']}"
                )

            accounts[data["account_number"]] = account

        # ============================================================
        # MERCHANTS
        # ============================================================

        merchants_data = [
            {
                "merchant_name": "Demo Electronics Store",
                "category": "Electronics",
                "city": "New Delhi",
                "country": "India",
            },
            {
                "merchant_name": "Metro Online Shopping",
                "category": "E-Commerce",
                "city": "Mumbai",
                "country": "India",
            },
            {
                "merchant_name": "QuickPay Services",
                "category": "Digital Services",
                "city": "Bengaluru",
                "country": "India",
            },
        ]

        merchants = {}

        for data in merchants_data:

            merchant = (
                db.query(Merchant)
                .filter(
                    Merchant.merchant_name
                    == data["merchant_name"]
                )
                .first()
            )

            if merchant is None:

                merchant = Merchant(
                    merchant_name=data["merchant_name"],
                    category=data["category"],
                    city=data["city"],
                    country=data["country"],
                )

                db.add(merchant)
                db.flush()

                print(
                    f"Merchant created: "
                    f"{data['merchant_name']}"
                )

            else:
                print(
                    f"Merchant exists: "
                    f"{data['merchant_name']}"
                )

            merchants[data["merchant_name"]] = merchant

        # ============================================================
        # DEVICES
        # ============================================================

        devices_data = [
            {
                "device_id": "DEVICE-DEMO-001",
                "device_type": "Mobile",
                "operating_system": "Android",
                "ip_address": "192.168.1.100",
            },
            {
                "device_id": "DEVICE-DEMO-002",
                "device_type": "Mobile",
                "operating_system": "iOS",
                "ip_address": "192.168.1.101",
            },
            {
                "device_id": "DEVICE-DEMO-003",
                "device_type": "Laptop",
                "operating_system": "Windows",
                "ip_address": "10.0.0.45",
            },
            {
                "device_id": "DEVICE-DEMO-004",
                "device_type": "Mobile",
                "operating_system": "Android",
                "ip_address": "10.0.0.46",
            },
        ]

        devices = {}

        for data in devices_data:

            device = (
                db.query(Device)
                .filter(
                    Device.device_id
                    == data["device_id"]
                )
                .first()
            )

            if device is None:

                device = Device(
                    device_id=data["device_id"],
                    device_type=data["device_type"],
                    operating_system=data["operating_system"],
                    ip_address=data["ip_address"],
                )

                db.add(device)
                db.flush()

                print(
                    f"Device created: "
                    f"{data['device_id']}"
                )

            else:
                print(
                    f"Device exists: "
                    f"{data['device_id']}"
                )

            devices[data["device_id"]] = device

        # ============================================================
        # TRANSACTIONS
        # ============================================================

        demo_transactions = [
            {
                "transaction_id": "TX-DEMO-1001",
                "amount": 2499.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 12,
                "risk_level": "LOW",
                "is_suspicious": 0,
                "account": "PAN-ACC-0001",
                "merchant": "Demo Electronics Store",
                "device": "DEVICE-DEMO-001",
            },
            {
                "transaction_id": "TX-DEMO-1002",
                "amount": 5899.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 21,
                "risk_level": "LOW",
                "is_suspicious": 0,
                "account": "PAN-ACC-0001",
                "merchant": "Metro Online Shopping",
                "device": "DEVICE-DEMO-001",
            },
            {
                "transaction_id": "TX-DEMO-1003",
                "amount": 12500.00,
                "transaction_type": "TRANSFER",
                "status": "SUCCESS",
                "risk_score": 67,
                "risk_level": "MEDIUM",
                "is_suspicious": 1,
                "account": "PAN-ACC-0002",
                "merchant": "QuickPay Services",
                "device": "DEVICE-DEMO-002",
            },
            {
                "transaction_id": "TX-DEMO-1004",
                "amount": 45999.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 82,
                "risk_level": "HIGH",
                "is_suspicious": 1,
                "account": "PAN-ACC-0002",
                "merchant": "Demo Electronics Store",
                "device": "DEVICE-DEMO-003",
            },
            {
                "transaction_id": "TX-DEMO-1005",
                "amount": 999.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 8,
                "risk_level": "LOW",
                "is_suspicious": 0,
                "account": "PAN-ACC-0003",
                "merchant": "Metro Online Shopping",
                "device": "DEVICE-DEMO-003",
            },
            {
                "transaction_id": "TX-DEMO-1006",
                "amount": 78500.00,
                "transaction_type": "TRANSFER",
                "status": "SUCCESS",
                "risk_score": 94,
                "risk_level": "CRITICAL",
                "is_suspicious": 1,
                "account": "PAN-ACC-0003",
                "merchant": "QuickPay Services",
                "device": "DEVICE-DEMO-004",
            },
            {
                "transaction_id": "TX-DEMO-1007",
                "amount": 3499.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 18,
                "risk_level": "LOW",
                "is_suspicious": 0,
                "account": "PAN-ACC-0004",
                "merchant": "Demo Electronics Store",
                "device": "DEVICE-DEMO-001",
            },
            {
                "transaction_id": "TX-DEMO-1008",
                "amount": 27500.00,
                "transaction_type": "TRANSFER",
                "status": "SUCCESS",
                "risk_score": 76,
                "risk_level": "HIGH",
                "is_suspicious": 1,
                "account": "PAN-ACC-0004",
                "merchant": "QuickPay Services",
                "device": "DEVICE-DEMO-004",
            },
            {
                "transaction_id": "TX-DEMO-1009",
                "amount": 18999.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 71,
                "risk_level": "HIGH",
                "is_suspicious": 1,
                "account": "PAN-ACC-0001",
                "merchant": "Demo Electronics Store",
                "device": "DEVICE-DEMO-003",
            },
            {
                "transaction_id": "TX-DEMO-1010",
                "amount": 6500.00,
                "transaction_type": "PURCHASE",
                "status": "SUCCESS",
                "risk_score": 15,
                "risk_level": "LOW",
                "is_suspicious": 0,
                "account": "PAN-ACC-0003",
                "merchant": "Metro Online Shopping",
                "device": "DEVICE-DEMO-002",
            },
        ]

        base_time = datetime.utcnow()

        for index, data in enumerate(demo_transactions):

            existing_transaction = (
                db.query(Transaction)
                .filter(
                    Transaction.transaction_id
                    == data["transaction_id"]
                )
                .first()
            )

            if existing_transaction is not None:

                print(
                    f"Transaction exists: "
                    f"{data['transaction_id']}"
                )

                continue

            transaction = Transaction(
                transaction_id=data["transaction_id"],
                amount=data["amount"],
                currency="INR",
                transaction_type=data["transaction_type"],
                status=data["status"],
                risk_score=data["risk_score"],
                risk_level=data["risk_level"],
                is_suspicious=data["is_suspicious"],
                created_at=(
                    base_time - timedelta(minutes=index * 7)
                ),
                account_id=accounts[
                    data["account"]
                ].id,
                merchant_id=merchants[
                    data["merchant"]
                ].id,
                device_id=devices[
                    data["device"]
                ].id,
            )

            db.add(transaction)

            print(
                f"Transaction created: "
                f"{data['transaction_id']} "
                f"| ₹{data['amount']} "
                f"| Risk {data['risk_score']}%"
            )

        # ============================================================
        # ADMIN USER
        # ============================================================

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

            admin.password = hash_password(
                "Admin@123"
            )

            admin.role = "admin"
            admin.organization_id = organization.id

            print("Admin user already exists.")

        # ============================================================
        # COMMIT
        # ============================================================

        db.commit()

        print("\n" + "=" * 60)
        print("PANOPTICON DEMO DATABASE READY")
        print("=" * 60)

        print(
            f"Organization: {organization.name}"
        )

        print(
            f"Accounts: {len(accounts)}"
        )

        print(
            f"Merchants: {len(merchants)}"
        )

        print(
            f"Devices: {len(devices)}"
        )

        print(
            f"Transactions: {len(demo_transactions)}"
        )

        print(
            "Admin Email: admin@panopticon.com"
        )

        print(
            "Admin Password: Admin@123"
        )

        print("=" * 60)

    except Exception:

        db.rollback()
        raise

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()