import { useState } from "react";
import { useMovies } from "@/contexts/MovieContext";
import type { HeroSlide } from "@/data/movies";
import { Plus, Pencil, Trash2 } from "lucide-react";
import heroBanner1 from "@/assets/hero-banner-1.jpg";

const AdminHero = () => {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, movies, series, tvChannels } = useMovies();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    genre: "", 
    year: 2026, 
    rating: 8.5,
    contentId: "",
    contentType: "movie" as "movie" | "series" | "tv-channel"
  });

  const resetForm = () => { 
    setForm({ 
      title: "", 
      description: "", 
      genre: "", 
      year: 2026, 
      rating: 8.5,
      contentId: "",
      contentType: "movie"
    }); 
    setEditingId(null); 
    setShowForm(false); 
  };

  const handleEdit = (s: HeroSlide) => {
    setForm({ 
      title: s.title, 
      description: s.description, 
      genre: s.genre, 
      year: s.year, 
      rating: s.rating,
      contentId: s.contentId || "",
      contentType: s.contentType || "movie"
    });
    setEditingId(s.id); 
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateHeroSlide(editingId, form);
    } else {
      addHeroSlide({ id: `hero-${Date.now()}`, ...form, image: heroBanner1 });
    }
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hero Carousel</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} required />
            <input type="number" className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            <input type="number" step="0.1" className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <textarea className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm md:col-span-2" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            
            <div className="md:col-span-1 flex flex-col gap-2">
              <label className="text-xs text-muted-foreground ml-1">Link to Content Type</label>
              <select 
                className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm"
                value={form.contentType}
                onChange={(e) => setForm({ ...form, contentType: e.target.value as any })}
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="tv-channel">TV Channel</option>
              </select>
            </div>

            <div className="md:col-span-1 flex flex-col gap-2">
              <label className="text-xs text-muted-foreground ml-1">Select Content</label>
              <select 
                className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm"
                value={form.contentId}
                onChange={(e) => setForm({ ...form, contentId: e.target.value })}
              >
                <option value="">None (Static link)</option>
                {form.contentType === "movie" && movies.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
                {form.contentType === "series" && series.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
                {form.contentType === "tv-channel" && tvChannels.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">{editingId ? "Update" : "Add"}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg bg-secondary text-foreground text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroSlides.map((s) => (
          <div key={s.id} className="relative rounded-xl overflow-hidden bg-card border border-border group">
            <img src={s.image} alt={s.title} className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.genre} • {s.year}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-primary"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteHeroSlide(s.id)} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHero;
