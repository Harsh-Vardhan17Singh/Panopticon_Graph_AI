from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device


class GraphService:
    """
    Converts financial transaction data into a graph
    of accounts, merchants, and devices.
    """

    def get_graph(
        self,
        db: Session,
    ) -> dict:

        transactions = (
            db.query(Transaction)
            .all()
        )

        nodes = {}
        edges = []

        for transaction in transactions:

            account = (
                db.query(Account)
                .filter(
                    Account.id == transaction.account_id
                )
                .first()
            )

            merchant = (
                db.query(Merchant)
                .filter(
                    Merchant.id == transaction.merchant_id
                )
                .first()
            )

            device = (
                db.query(Device)
                .filter(
                    Device.id == transaction.device_id
                )
                .first()
            )

            # -----------------------------
            # ACCOUNT NODE
            # -----------------------------

            if account:

                account_node_id = (
                    f"account-{account.id}"
                )

                nodes[account_node_id] = {
                    "id": account_node_id,
                    "label": (
                        f"Account: "
                        f"{account.account_number}"
                    ),
                    "type": "ACCOUNT",
                }

            # -----------------------------
            # MERCHANT NODE
            # -----------------------------

            if merchant:

                merchant_node_id = (
                    f"merchant-{merchant.id}"
                )

                nodes[merchant_node_id] = {
                    "id": merchant_node_id,
                    "label": (
                        f"Merchant: "
                        f"{merchant.merchant_name}"
                    ),
                    "type": "MERCHANT",
                }

            # -----------------------------
            # DEVICE NODE
            # -----------------------------

            if device:

                device_node_id = (
                    f"device-{device.id}"
                )

                nodes[device_node_id] = {
                    "id": device_node_id,
                    "label": (
                        f"Device: "
                        f"{device.device_id}"
                    ),
                    "type": "DEVICE",
                }

            # -----------------------------
            # ACCOUNT -> MERCHANT
            # -----------------------------

            if account and merchant:

                edges.append({
                    "source": (
                        f"account-{account.id}"
                    ),
                    "target": (
                        f"merchant-{merchant.id}"
                    ),
                    "relationship": "MERCHANT_PAYMENT",
                })

            # -----------------------------
            # ACCOUNT -> DEVICE
            # -----------------------------

            if account and device:

                edges.append({
                    "source": (
                        f"account-{account.id}"
                    ),
                    "target": (
                        f"device-{device.id}"
                    ),
                    "relationship": "USED_DEVICE",
                })

        return {
            "nodes": list(nodes.values()),
            "edges": edges,
        }


graph_service = GraphService()