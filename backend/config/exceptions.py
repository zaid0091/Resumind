from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data
        code = getattr(exc, "default_code", "error")
        message = detail

        if isinstance(detail, dict):
            message = detail.pop("detail", None) or list(detail.values())[0]
            if isinstance(message, list):
                message = message[0]
            if isinstance(message, str):
                pass
            else:
                message = str(message)
        elif isinstance(detail, list):
            message = detail[0] if detail else "An error occurred"

        response.data = {
            "error": str(message),
            "code": code.upper().replace(" ", "_"),
            "details": detail if isinstance(detail, dict) else {},
        }

    return response
