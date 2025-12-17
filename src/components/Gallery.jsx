import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Copy,
  LayoutGrid,
  StretchHorizontal,
  Trash2,
  Search,
  Check,
} from "lucide-react";

// --- Sub-Components ---

const TagModal = ({ isOpen, onClose, onConfirm }) => {
  const tags = ["Sci-Fi", "Romantic", "Favorite", "Minimal"];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        <h3 className="text-xl font-bold text-white mb-2">Tag this Artifact</h3>
        <p className="text-gray-400 text-sm mb-6">
          Select a category for your library.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onConfirm(tag)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/50 text-gray-300 hover:text-white transition-all text-sm font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

const ImageCard = ({
  img,
  isSaved,
  onToggleSave,
  onRemove,
  context,
  viewMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const autoHideTimer = useRef(null);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `https://picsum.photos/id/${img.id}/800/1000`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardTap = () => {
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    setShowOverlay((prev) => {
      if (!prev) {
        autoHideTimer.current = setTimeout(() => setShowOverlay(false), 3000);
        return true;
      }
      return false;
    });
  };

  // Logic to determine visibility (Hover on Desktop OR Tapped on Mobile)
  const isVisible = showOverlay
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      onClick={handleCardTap}
      className={`group relative overflow-hidden rounded-2xl bg-gray-900 border border-white/10 shadow-lg cursor-pointer
        ${viewMode === "compact" ? "aspect-[3/4]" : "aspect-[4/5]"}
      `}
    >
      {/* IMAGE LAYER: 
         - Removed grayscale
         - Removed brightness filters
         - Removed dark overlay divs
         - Only scale effect remains
      */}
      <img
        src={`https://picsum.photos/id/${img.id}/600/800`}
        alt={img.author}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* --- FLOATING UI LAYER (Glassmorphism) --- */}

      {/* Top Right: Floating Action Pill */}
      <div
        className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 z-20 ${isVisible}`}
      >
        <div className="flex gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            onClick={handleCopy}
            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <Check size={16} strokeWidth={3} className="text-green-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          {context === "library" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(img.id);
              }}
              className="p-2 rounded-full text-red-400 hover:bg-white/20 transition-colors"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(img);
              }}
              className={`p-2 rounded-full transition-colors ${
                isSaved ? "text-cyan-400" : "text-white hover:bg-white/20"
              }`}
            >
              <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom: Info Glass Capsule */}
      <div
        className={`absolute bottom-4 left-4 right-4 transition-all duration-500 ${isVisible}`}
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-[9px] uppercase tracking-widest text-cyan-400 mb-1 font-bold">
            Artist
          </p>
          <h3 className="text-sm font-bold text-white truncate">
            {img.author}
          </h3>
        </div>
      </div>

      {/* Static Tag Badge (Library Only) - Now also in a glass chip */}
      {context === "library" && img.tag && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-md shadow-lg z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-200">
            {img.tag}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Component (Unchanged) ---

const Gallery = () => {
  const [view, setView] = useState("explore");
  const [images, setImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [gridView, setGridView] = useState("comfortable");
  const [activeTag, setActiveTag] = useState("All");
  const [activeAuthor, setActiveAuthor] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gallery_saved")) || [];
    setSavedImages(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("gallery_saved", JSON.stringify(savedImages));
  }, [savedImages]);

  useEffect(() => {
    if (view === "explore") fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://picsum.photos/v2/list?page=${page}&limit=12`
      );
      setImages((prev) => {
        const newImages = res.data.filter(
          (newImg) => !prev.some((existing) => existing.id === newImg.id)
        );
        return [...prev, ...newImages];
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (view !== "explore") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) setPage((prev) => prev + 1);
      },
      { threshold: 1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, view]);

  const initiateSave = (img) => {
    const exists = savedImages.find((i) => i.id === img.id);
    if (exists) {
      setSavedImages((prev) => prev.filter((i) => i.id !== img.id));
    } else {
      setPendingImage(img);
      setModalOpen(true);
    }
  };

  const confirmSave = (tag) => {
    if (pendingImage) {
      const newSaved = { ...pendingImage, tag, savedAt: Date.now() };
      setSavedImages((prev) => [newSaved, ...prev]);
      setPendingImage(null);
      setModalOpen(false);
    }
  };

  const removeFromLibrary = (id) => {
    setSavedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const getFilteredImages = () => {
    let data = view === "explore" ? images : savedImages;
    if (search.trim())
      data = data.filter((img) =>
        img.author.toLowerCase().includes(search.toLowerCase())
      );
    if (view === "explore") {
      if (activeAuthor !== "All")
        data = data.filter((img) => img.author === activeAuthor);
    } else {
      if (activeTag !== "All")
        data = data.filter((img) => img.tag === activeTag);
    }
    return data;
  };

  const displayImages = getFilteredImages();
  const authors = useMemo(
    () => ["All", ...new Set(images.map((img) => img.author))],
    [images]
  );
  const tags = ["All", "Sci-Fi", "Romantic", "Favorite", "Minimal"];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
            <button
              onClick={() => {
                setView("explore");
                setSearch("");
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                view === "explore"
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => {
                setView("library");
                setSearch("");
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                view === "library"
                  ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Library{" "}
              {savedImages.length > 0 && (
                <span className="ml-1 opacity-70">({savedImages.length})</span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Search authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              />
            </div>
            <button
              onClick={() =>
                setGridView((prev) =>
                  prev === "comfortable" ? "compact" : "comfortable"
                )
              }
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle Grid View"
            >
              {gridView === "comfortable" ? (
                <LayoutGrid size={20} />
              ) : (
                <StretchHorizontal size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="mb-10 space-y-6">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-2">
              {view === "explore" ? "Visual Discovery." : "Your Vault."}
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
              {view === "explore" ? "Infinite Stream" : "Curated Collection"}
            </p>
          </motion.div>
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-xl max-w-full no-scrollbar">
              {(view === "explore" ? authors.slice(0, 6) : tags).map((item) => {
                const isActive =
                  view === "explore"
                    ? activeAuthor === item
                    : activeTag === item;
                return (
                  <button
                    key={item}
                    onClick={() =>
                      view === "explore"
                        ? setActiveAuthor(item)
                        : setActiveTag(item)
                    }
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "text-gray-500 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          layout
          className={`grid gap-6 ${
            gridView === "compact"
              ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {displayImages.map((img, index) => (
              <ImageCard
                key={`${img.id}-${view}`}
                img={img}
                context={view}
                viewMode={gridView}
                isSaved={savedImages.some((saved) => saved.id === img.id)}
                onToggleSave={initiateSave}
                onRemove={removeFromLibrary}
              />
            ))}
          </AnimatePresence>
          {view === "library" && displayImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-4 text-gray-600">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-gray-500 text-lg">
                No artifacts found in vault.
              </p>
              <button
                onClick={() => setView("explore")}
                className="mt-4 text-cyan-400 text-sm hover:underline"
              >
                Go Explore
              </button>
            </motion.div>
          )}
          {view === "explore" &&
            loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-900 border border-white/5"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              </div>
            ))}
        </motion.div>

        <div ref={observerRef} className="h-20 w-full" />
        <AnimatePresence>
          {modalOpen && (
            <TagModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onConfirm={confirmSave}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery;
