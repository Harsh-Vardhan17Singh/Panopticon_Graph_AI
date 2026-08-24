from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device


class GraphService:
    """
    Converts transaction data into a graph of
    accounts, merchants, and devices.

    Duplicate relationships are merged together.
    """

    def get_graph(self, db: Session) -> dict:

        transactions = (
            db.query(Transaction)
            .all()
        )

        nodes = {}
        edges = {}

        for transaction in transactions:

            # -----------------------------
            # GET RELATED RECORDS
            # -----------------------------

            account = (
                db.query(Account)
                .filter(Account.id == transaction.account_id)
                .first()
            )

            merchant = (
                db.query(Merchant)
                .filter(Merchant.id == transaction.merchant_id)
                .first()
            )

            device = (
                db.query(Device)
                .filter(Device.id == transaction.device_id)
                .first()
            )

            # -----------------------------
            # ACCOUNT NODE
            # -----------------------------

            if account:

                account_node_id = f"account-{account.id}"

                nodes[account_node_id] = {
                    "id": account_node_id,
                    "label": f"Account: {account.account_number}",
                    "type": "ACCOUNT",
                }

            # -----------------------------
            # MERCHANT NODE
            # -----------------------------

            if merchant:

                merchant_node_id = f"merchant-{merchant.id}"

                nodes[merchant_node_id] = {
                    "id": merchant_node_id,
                    "label": f"Merchant: {merchant.merchant_name}",
                    "type": "MERCHANT",
                }

            # -----------------------------
            # DEVICE NODE
            # -----------------------------

            if device:

                device_node_id = f"device-{device.id}"

                nodes[device_node_id] = {
                    "id": device_node_id,
                    "label": f"Device: {device.device_id}",
                    "type": "DEVICE",
                }

            # -----------------------------
            # ACCOUNT -> MERCHANT
            # -----------------------------

            if account and merchant:

                source = f"account-{account.id}"
                target = f"merchant-{merchant.id}"

                edge_key = (
                    source,
                    target,
                    "MERCHANT_PAYMENT",
                )

                if edge_key not in edges:

                    edges[edge_key] = {
                        "source": source,
                        "target": target,
                        "relationship": "MERCHANT_PAYMENT",
                        "transaction_count": 0,
                        "total_amount": 0.0,
                    }

                edges[edge_key]["transaction_count"] += 1

                edges[edge_key]["total_amount"] += float(
                    transaction.amount
                )

            # -----------------------------
            # ACCOUNT -> DEVICE
            # -----------------------------

            if account and device:

                source = f"account-{account.id}"
                target = f"device-{device.id}"

                edge_key = (
                    source,
                    target,
                    "USED_DEVICE",
                )

                if edge_key not in edges:

                    edges[edge_key] = {
                        "source": source,
                        "target": target,
                        "relationship": "USED_DEVICE",
                        "transaction_count": 0,
                        "total_amount": 0.0,
                    }

                edges[edge_key]["transaction_count"] += 1

                edges[edge_key]["total_amount"] += float(
                    transaction.amount
                )

        return {
            "nodes": list(nodes.values()),
            "edges": list(edges.values()),
        }


graph_service = GraphService()