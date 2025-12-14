import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("All");

  const observerRef = useRef(null);
  const limit = 9;

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    setLoading(true);
    const res = await axios.get(
      `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
    );
    setImages((prev) => [...prev, ...res.data]);
    setLoading(false);
  };

  /* Infinite Scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  /* Filters */
  const authors = ["All", ...new Set(images.map((img) => img.author))];

  const filteredImages =
    authorFilter === "All"
      ? images
      : images.filter((img) => img.author === authorFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        Infinite Creative Gallery
      </h1>

      {/* Filter Bar */}
      <div className="flex justify-center gap-3 flex-wrap mb-10">
        {authors.slice(0, 6).map((author) => (
          <button
            key={author}
            onClick={() => setAuthorFilter(author)}
            className={`px-4 py-1 rounded-full text-sm transition
              ${
                authorFilter === author
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
          >
            {author}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredImages.map((img) => (
          <motion.div
            key={`${img.id}-${img.author}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl"
          >
            <img
              src={`https://picsum.photos/id/${img.id}/600/400`}
              alt={img.author}
              className="w-full h-[220px] object-cover"
            />

            <div className="p-4">
              <p className="text-xs text-gray-400">Photographer</p>
              <h3 className="text-lg font-semibold">{img.author}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loader Trigger */}
      <div ref={observerRef} className="h-20 flex justify-center items-center">
        {loading && <p className="text-gray-400">Loading more...</p>}
      </div>
    </div>
  );
};

export default Gallery;
