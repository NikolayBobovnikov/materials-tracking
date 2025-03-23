import base64

def to_global_id(type_name: str, database_id: int) -> str:
    """
    Encodes a global ID in the format Base64("TypeName:database_id").
    """
    raw_id = f"{type_name}:{database_id}"
    return base64.b64encode(raw_id.encode("utf-8")).decode("utf-8")

def from_global_id(global_id: str) -> tuple:
    """
    Decodes a global ID from Base64 format to (type_name, database_id)
    """
    try:
        decoded = base64.b64decode(global_id).decode("utf-8")
        type_name, db_id_str = decoded.split(":")
        db_id = int(db_id_str)
        return type_name, db_id
    except Exception:
        return None, None 