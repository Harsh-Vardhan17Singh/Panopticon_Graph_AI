from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models.user import User
from app.models.organization import Organization
from app.models.account import Account
from app.models.device import Device
from app.models.merchant import Merchant
from app.models.transaction import Transaction
from app.models.fraud_case import FraudCase
from app.models.alert import Alert