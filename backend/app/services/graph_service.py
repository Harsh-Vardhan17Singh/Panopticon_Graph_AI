from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.account import Account
from app.models.merchant import Merchant
from app.models.device import Device


class GraphService:
    """
    Converts financial transaction data into a graph
    and provides real node-level graph analytics.
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
        edge_map = {}

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
                account_node_id = f"account-{account.id}"

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
                merchant_node_id = f"merchant-{merchant.id}"

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
                device_node_id = f"device-{device.id}"

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

                key = (
                    f"account-{account.id}",
                    f"merchant-{merchant.id}",
                    "MERCHANT_PAYMENT",
                )

                if key not in edge_map:
                    edge_map[key] = {
                        "source": f"account-{account.id}",
                        "target": f"merchant-{merchant.id}",
                        "relationship": "MERCHANT_PAYMENT",
                        "transaction_count": 0,
                        "total_amount": 0.0,
                    }

                edge_map[key]["transaction_count"] += 1
                edge_map[key]["total_amount"] += (
                    transaction.amount or 0
                )

            # -----------------------------
            # ACCOUNT -> DEVICE
            # -----------------------------

            if account and device:

                key = (
                    f"account-{account.id}",
                    f"device-{device.id}",
                    "USED_DEVICE",
                )

                if key not in edge_map:
                    edge_map[key] = {
                        "source": f"account-{account.id}",
                        "target": f"device-{device.id}",
                        "relationship": "USED_DEVICE",
                        "transaction_count": 0,
                        "total_amount": 0.0,
                    }

                edge_map[key]["transaction_count"] += 1
                edge_map[key]["total_amount"] += (
                    transaction.amount or 0
                )

        edges = list(edge_map.values())

        return {
            "nodes": list(nodes.values()),
            "edges": edges,
        }

    # =========================================================
    # NODE ANALYTICS
    # =========================================================

    def get_node_details(
        self,
        db: Session,
        node_id: str,
    ) -> dict | None:

        # -----------------------------------------
        # PARSE NODE ID
        # -----------------------------------------

        try:
            node_type, raw_id = node_id.split("-", 1)
            entity_id = int(raw_id)
        except (ValueError, AttributeError):
            return None

        # -----------------------------------------
        # ACCOUNT
        # -----------------------------------------

        if node_type == "account":

            entity = (
                db.query(Account)
                .filter(Account.id == entity_id)
                .first()
            )

            if entity is None:
                return None

            transactions = (
                db.query(Transaction)
                .filter(
                    Transaction.account_id == entity_id
                )
                .all()
            )

        # -----------------------------------------
        # MERCHANT
        # -----------------------------------------

        elif node_type == "merchant":

            entity = (
                db.query(Merchant)
                .filter(Merchant.id == entity_id)
                .first()
            )

            if entity is None:
                return None

            transactions = (
                db.query(Transaction)
                .filter(
                    Transaction.merchant_id == entity_id
                )
                .all()
            )

        # -----------------------------------------
        # DEVICE
        # -----------------------------------------

        elif node_type == "device":

            entity = (
                db.query(Device)
                .filter(Device.id == entity_id)
                .first()
            )

            if entity is None:
                return None

            transactions = (
                db.query(Transaction)
                .filter(
                    Transaction.device_id == entity_id
                )
                .all()
            )

        else:
            return None

        # -----------------------------------------
        # BASIC ANALYTICS
        # -----------------------------------------

        transaction_count = len(transactions)

        total_amount = sum(
            transaction.amount or 0
            for transaction in transactions
        )

        suspicious_transactions = [
            transaction
            for transaction in transactions
            if transaction.is_suspicious == 1
        ]

        suspicious_count = len(
            suspicious_transactions
        )

        suspicious_amount = sum(
            transaction.amount or 0
            for transaction in suspicious_transactions
        )

        # -----------------------------------------
        # RISK
        # -----------------------------------------

        if transactions:

            average_risk_score = (
                sum(
                    transaction.risk_score or 0
                    for transaction in transactions
                )
                / transaction_count
            )

            highest_risk_score = max(
                transaction.risk_score or 0
                for transaction in transactions
            )

            risk_levels = [
                transaction.risk_level
                for transaction in transactions
                if transaction.risk_level
            ]

            if "HIGH" in risk_levels:
                risk_level = "HIGH"
            elif "MEDIUM" in risk_levels:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

        else:

            average_risk_score = 0
            highest_risk_score = 0
            risk_level = "LOW"

        # -----------------------------------------
        # CONNECTED ENTITIES
        # -----------------------------------------

        connected_accounts = {
            transaction.account_id
            for transaction in transactions
            if transaction.account_id is not None
        }

        connected_merchants = {
            transaction.merchant_id
            for transaction in transactions
            if transaction.merchant_id is not None
        }

        connected_devices = {
            transaction.device_id
            for transaction in transactions
            if transaction.device_id is not None
        }

        connected_entities = (
            len(connected_accounts)
            + len(connected_merchants)
            + len(connected_devices)
        )

        # -----------------------------------------
        # SUSPICIOUS ACTIVITY %
        # -----------------------------------------

        suspicious_percentage = (
            (suspicious_count / transaction_count) * 100
            if transaction_count > 0
            else 0
        )

        # -----------------------------------------
        # DISPLAY LABEL
        # -----------------------------------------

        if node_type == "account":
            label = f"Account: {entity.account_number}"

        elif node_type == "merchant":
            label = f"Merchant: {entity.merchant_name}"

        else:
            label = f"Device: {entity.device_id}"

        # -----------------------------------------
        # EXPLANATION
        # -----------------------------------------

        if suspicious_count > 0:

            explanation = (
                f"{label} has processed "
                f"{transaction_count} transaction(s) "
                f"worth ₹{total_amount:,.0f}. "
                f"{suspicious_count} transaction(s) "
                f"were flagged as suspicious, "
                f"representing ₹{suspicious_amount:,.0f} "
                f"in potentially risky activity."
            )

        else:

            explanation = (
                f"{label} has processed "
                f"{transaction_count} transaction(s) "
                f"worth ₹{total_amount:,.0f}. "
                f"No suspicious transactions "
                f"are currently associated with this entity."
            )

        return {
            "node_id": node_id,
            "label": label,
            "type": node_type.upper(),

            "transaction_count": transaction_count,
            "total_amount": float(total_amount),

            "suspicious_count": suspicious_count,
            "suspicious_amount": float(
                suspicious_amount
            ),

            "suspicious_percentage": round(
                suspicious_percentage,
                2,
            ),

            "average_risk_score": round(
                average_risk_score,
                2,
            ),

            "highest_risk_score": highest_risk_score,
            "risk_level": risk_level,

            "connected_entities": connected_entities,

            "explanation": explanation,
        }


graph_service = GraphService()