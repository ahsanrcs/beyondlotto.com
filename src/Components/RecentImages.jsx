import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import moment from "moment";
import { db } from "../firebase";
import { useStateValue } from "../State/Stateprovider";

const RecentImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTickets, setShowTickets] = useState(false);
  const [{ user }] = useStateValue();

  useEffect(() => {
    const fetchRecentImages = async () => {
        // if (!user?.region) {
        //   console.error("User region not available");
        //   setLoading(false);
        //   return;
        // }
      try {
         // Log user region for debugging
         console.log("User Region:", user.region);
        // Calculate timestamp for 10 days ago
        const tenDaysAgo = Timestamp.fromDate(
          moment().subtract(10, "days").toDate()
        );

        // Query the `games` collection for documents where `created_at` is within the last 10 days
        const gamesCollection = collection(db, "games");
        const recentQuery = query(
          gamesCollection,
          where("created_at", ">", tenDaysAgo),
          
        );
        // Extract and store image data
        const snapshot = await getDocs(recentQuery);
        const fetchedImages = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }));
          // .filter((image) => image.region === user.region); // Filter by region

        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching recent images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentImages();
  }, []);

  // Update `showTickets` when images are fetched
  useEffect(() => {
    if (images.length > 0) {
      setShowTickets(true);
    }
  }, [images]);

  if (loading) {
    return <div>Loading images...</div>;
  }

  return (
    <>
      {showTickets && (
        <div
          className="recent-images-container mt-2 mb-4"
          style={{
            borderBottom: "2px solid #ccc", // Retaining the bottom border
            paddingBottom: "15px", // Padding for separation
          }}
        >
          <h4 className="mb-3 text-black">
          New Tickets Now Available – Add Them to Your Screens Today!
          </h4>
          <div className="row justify-content-center">
            {images.map((image) => (
              <div
                key={image.id}
                className="text-center"
                style={{
                  width: "100px", // Fixed width for each column
                  margin: "1px", // Minimal margin
                  border: "1px solid #000", // Border around each container
                  borderRadius: "5px", // Optional: Add rounded corners to the border
                  padding: "1px", // Optional: Add some padding inside the border
                  backgroundColor: "#fff", // Optional: Set background color
                }}
              >
                <div
                  className="text-black"
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    marginTop: "2px",
                  }}
                >
                  {image?.ticket_value}
                </div>
                <img
                  src={image.image_url}
                  alt="game thumbnail"
                  className="img-fluid rounded"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    margin: "auto",
                  }}
                />
                <div
                  className="text-black"
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    marginTop: "2px",
                  }}
                >
                  #{image?.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentImages;
