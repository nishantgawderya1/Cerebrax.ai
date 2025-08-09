import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [likeLoadingIds, setLikeLoadingIds] = useState(new Set());

  // Fetch published creations with authentication token
  const fetchCreations = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message || "Failed to fetch creations.");
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
      toast.error("Failed to fetch creations.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle like functionality with loading state per creation for better UX
  const imageLikeToggle = async (id) => {
    if (likeLoadingIds.has(id)) return; // Prevent multiple clicks on same item

    try {
      setLikeLoadingIds((prev) => new Set(prev).add(id));

      const token = await getToken();
      if (!token) {
        toast.error("Authentication required.");
        setLikeLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        return;
      }

      const { data } = await axios.post(
        "/api/user/toggle-creation-like",
        { creationId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message || "Like toggled successfully.");
        // Refresh creations to update like counts and states
        await fetchCreations();
      } else {
        toast.error(data.message || "Failed to toggle like.");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle like."
      );
    } finally {
      setLikeLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Fetch creations on user load
  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  const userId = user?.id;

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <div className="font-semibold mb-2">Creations</div>
      {loading ? (
        <div className="text-center text-gray-500">Loading creations...</div>
      ) : (
        <div className="bg-white rounded-xl overflow-y-scroll flex flex-wrap gap-6">
          {creations.length === 0 ? (
            <p className="p-4 text-gray-600">No creations found.</p>
          ) : (
            creations.map((creation, index) => {
              const likedByUser =
                creation.likes && userId && creation.likes.includes(userId);
              const isLikeLoading = likeLoadingIds.has(creation.id);
              return (
                <div
                  key={index}
                  className="relative group p-3 w-full sm:w-1/2 lg:w-1/3"
                >
                  <img
                    src={creation.content}
                    alt={creation.prompt}
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex gap-2 items-end justify-end group-hover:justify-between p-3 bg-gradient-to-b from-transparent to-black/50 text-white rounded-lg transition-all duration-300">
                    <p className="text-sm opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {creation.prompt}
                    </p>
                    <div className="flex gap-1 items-center ml-auto">
                      <p>{creation.likes ? creation.likes.length : 0}</p>
                      <Heart
                        role="button"
                        aria-label={likedByUser ? "Unlike" : "Like"}
                        onClick={() => imageLikeToggle(creation.id)}
                        className={`w-5 h-5 hover:scale-110 cursor-pointer transition-transform duration-150 ${
                          likedByUser
                            ? "fill-red-500 text-red-600"
                            : "text-white"
                        } ${isLikeLoading ? "opacity-50 cursor-wait" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
