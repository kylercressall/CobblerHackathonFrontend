import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import femaleAvatar from "./15.png";
import maleAvatar from "./16.png";

const SUPABASE_URL = "https://gyduwmtijpbgvuveozql.supabase.co"; // Replace with your Supabase URL
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZHV3bXRpanBiZ3Z1dmVvenFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNTczNTYsImV4cCI6MjA1NjYzMzM1Nn0.2BG8US9ZL60ZzmtQKGXKskvk56oT3FyABPCcPvzRbLY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from the database
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("Users")
      .select("userID, email");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
  };

  const fetchContacts = async (userID) => {
    if (!userID) return;

    const { data: relationships, error: relationshipError } = await supabase
      .from("Relationships")
      .select("contactID, relationship_strength")
      .eq("userID", userID); // make the current user match the userid in the relationship

    if (relationshipError) {
      console.error("Error fetching relationships:", relationshipError);
      return;
    }

    if (!relationships.length) {
      setContacts([]);
      return;
    }

    const contactMap = new Map(
      relationships.map((rel) => [rel.contactID, rel.relationship_strength])
    );
    const contactIDs = Array.from(contactMap.keys());

    const { data: contactsData, error: contactsError } = await supabase
      .from("Contacts")
      .select("*")
      .in("contactID", contactIDs);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
    } else {
      const filteredContacts = contactsData.map((contact) => ({
        ...contact,
        relationship_strength: contactMap.get(contact.contactID) || 0, // default to 0 if missing
      }));

      setContacts(filteredContacts);
    }
  };

  const handleUserChange = (event) => {
    const userID = event.target.value;
    setSelectedUser(userID);
    fetchContacts(userID);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Cobbler Network</h2>

      {/* User selection dropdown */}
      <label>Select User: </label>
      <select onChange={handleUserChange} value={selectedUser || ""}>
        <option value="">-- Select User --</option>
        {users.map((user) => (
          <option key={user.userID} value={user.userID}>
            {user.email}
          </option>
        ))}
      </select>

      {/* Display contacts */}
      {selectedUser && (
        <div>
          <h3>Contacts</h3>
          {contacts.length === 0 ? (
            <p>No contacts found.</p>
          ) : (
            <ul>
              {contacts.map((contact) => {
                // Hardcode profile images based on temporary gender flag
                let profileImage = contact.profile_url;
                if (profileImage === "2") {
                  profileImage = femaleAvatar;
                } else if (profileImage === "1") {
                  profileImage = maleAvatar;
                }

                return (
                  <li key={contact.contactID} style={{ marginBottom: "10px" }}>
                    <img
                      src={profileImage}
                      alt={`${contact.firstname} ${contact.lastname}`}
                      width="50"
                      height="50"
                      style={{ borderRadius: "50%", marginRight: "10px" }}
                    />
                    <strong>
                      {contact.firstname} {contact.lastname}
                    </strong>
                    <p>{contact.contact_description}</p>
                    <p>
                      <strong>Relationship Strength:</strong>{" "}
                      {contact.relationship_strength} / 10
                    </p>
                    <a
                      href={contact.contact_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
