import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'ratemyprofessor-8efab',
})

db = firestore.client()

def store_conversation(user_id: str, conversation: dict):
    """Store conversation data in Firestore under the user's document."""
    try:
        user_ref = db.collection('users').document(user_id)
        # Append the new conversation to the existing conversation history
        user_ref.update({
            'conversation_history': firestore.ArrayUnion([conversation])
        })
        print(f"Conversation stored successfully for user {user_id}.")
    except Exception as e:
        print(f"Error storing conversation: {e}")
