import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

# Get the absolute path to the keys directory
# From src/py/ we need to go up 2 levels to reach the root
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
keys_path = os.path.join(project_root, "keys", "mykey.json")

cred = credentials.Certificate(keys_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def testFirebaseConnection():
    """Test if Firebase connection is working"""
    try:
        # Try to access the database
        db.collection("summaries").limit(1).get()
        return True
    except Exception as e:
        print(f"Firebase connection error: {e}")
        return False

# Save summary
async def saveSummary(file_name, summary_text):
    try:
        print(f"Attempting to save summary for file: {file_name}")
        print(f"Summary text length: {len(summary_text)} characters")
        print(f"Firebase db object: {db}")
        
        result = db.collection("summaries").document(file_name).set({
            "file": file_name,
            "summary": summary_text
        })
        print(f"Summary saved successfully! Result: {result}")
        return True
    except Exception as e:
        print(f"Error saving summary: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return False

def getSummary(file_name):
    try:
        doc = db.collection("summaries").document(file_name).get()
        if doc.exists:
            return doc.to_dict()["summary"]
        return None
    except Exception as e:
        print(f"Error getting summary: {e}")
        return None

def getAllSummaries():
    """Get all summaries from the database"""
    try:
        summaries = []
        docs = db.collection("summaries").stream()
        for doc in docs:
            data = doc.to_dict()
            summaries.append({
                "id": doc.id,
                "file": data.get("file", ""),
                "summary": data.get("summary", "")
            })
        return summaries
    except Exception as e:
        print(f"Error getting all summaries: {e}")
        return []

if __name__ == "__main__":
    if testFirebaseConnection():
        print("Firebase connection successful!")
        # Call saveSummary to actually write data
        success = saveSummary("my_first_document", "This is a test summary from my Python script.")
        if success:
            print("Summary saved successfully!")
        else:
            print("Failed to save summary.")

        # You can also try reading it back
        retrieved_summary = getSummary("my_first_document")
        if retrieved_summary:
            print(f"Retrieved summary: {retrieved_summary}")
        else:
            print("Failed to retrieve summary or summary not found.")
    else:
        print("Firebase connection failed. Check your credentials and network.")