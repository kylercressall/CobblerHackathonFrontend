import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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

    const { data, error } = await supabase
      .from("Relationships")
      .select("contactID, relationship_strength");

    if (error) {
      console.error("Error fetching relationships:", error);
      return;
    }

    // Extract contact IDs and relationship strengths
    const contactMap = new Map(
      data.map((rel) => [rel.contactID, rel.relationship_strength])
    );
    const contactIDs = Array.from(contactMap.keys());

    if (contactIDs.length === 0) {
      setContacts([]);
      return;
    }

    // Fetch contact details
    const { data: contactsData, error: contactsError } = await supabase
      .from("Contacts")
      .select("*")
      .in("contactID", contactIDs);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
    } else {
      // Merge contacts with their relationship strength
      const contactsWithStrength = contactsData.map((contact) => ({
        ...contact,
        relationship_strength: contactMap.get(contact.contactID) || 0, // Default to 0 if missing
      }));
      setContacts(contactsWithStrength);
    }
  };

  // Handle dropdown change
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
                // Hardcode profile images based on gender flag
                let profileImage = contact.profile_url;
                if (profileImage === "2") {
                  profileImage =
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthumbs.dreamstime.com%2Fb%2Fdefault-avatar-female-profile-user-icon-picture-portrait-symbol-member-people-flat-style-circle-button-photo-silhouette-270625866.jpg&f=1&nofb=1&ipt=5ab2761eb4a7037c3a625a8c281fd72738d06b0be8d828169cdffe9a9b618684&ipo=images";
                } else if (profileImage === "1") {
                  profileImage =
                    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcampussafetyconference.com%2Fwp-content%2Fuploads%2F2020%2F08%2FiStock-476085198.jpg&f=1&nofb=1&ipt=4bfd8b90ca61a4099ebc30d4027fa0de0255e0aab404eea83afa0305b8a2f343&ipo=images";
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
