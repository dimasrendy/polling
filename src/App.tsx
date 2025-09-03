import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

type Person = {
  id: string;
  name: string;
  votes: number;
};

export default function PollingApp() {
  const [title, setTitle] = useState("Who should be our team lead?");
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem("poll_people_v1");
    return saved
      ? (JSON.parse(saved) as Person[])
      : [
          { id: uid(), name: "Ayla", votes: 0 },
          { id: uid(), name: "Bima", votes: 0 },
          { id: uid(), name: "Citra", votes: 0 },
        ];
  });
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("poll_selected_v1");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [saved]; // fallback if it was stored as plain string
    }
  });
  const [pulseId, setPulseId] = useState("");

  useEffect(() => {
    localStorage.setItem("poll_people_v1", JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem("poll_selected_v1", JSON.stringify(selected));
  }, [selected]);

  const totalVotes = useMemo(
    () => people.reduce((sum, p) => sum + p.votes, 0),
    [people]
  );

  function addPerson() {
    const name = input.trim();
    if (!name) return;
    setPeople((prev) => [...prev, { id: uid(), name, votes: 0 }]);
    setInput("");
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => prev.filter((sid) => sid !== id));
  }

  function resetVotes() {
    setPeople((prev) => prev.map((p) => ({ ...p, votes: 0 })));
    setSelected([]);
    setPulseId("");
    localStorage.removeItem("poll_selected_v1");
  }

  function handleVote(id: string) {
    if (selected.includes(id)) return; // prevent duplicate vote on same person

    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
    setSelected((prev) => [...prev, id]);
    setPulseId(id);
    setTimeout(() => setPulseId(""), 1200);
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="mx-auto grid gap-6 p-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Poll title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base outline-none ring-0 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Add people
              </label>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                  placeholder="Type a name and press Enter"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  onClick={addPerson}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[.98]"
                >
                  Add
                </button>
              </div>

              <ul className="mt-4 space-y-2">
                <AnimatePresence>
                  {people.map((p) => (
                    <motion.li
                      key={p.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="truncate font-medium">{p.name}</span>
                      <button
                        onClick={() => removePerson(p.id)}
                        className="rounded-lg px-2 py-1 text-xs text-white hover:bg-slate-100"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                {title}
              </h1>
              <div className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {people.map((p) => {
                const isSelected = selected.includes(p.id);
                return (
                  <motion.button
                    key={p.id}
                    layoutId={`card-${p.id}`}
                    onClick={() => handleVote(p.id)}
                    whileTap={{ scale: 0.98 }}
                    className={[
                      "group relative flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition",
                      isSelected
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "grid h-12 w-12 place-items-center rounded-xl font-bold",
                        isSelected
                          ? "bg-emerald-500/90 text-white"
                          : "bg-white text-slate-700 border border-slate-200",
                      ].join(" ")}
                    >
                      {p.name?.[0]?.toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-lg font-semibold text-white">
                          {p.name}
                        </p>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                            >
                              Selected
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: totalVotes
                              ? `${Math.round(
                                  (p.votes / Math.max(1, totalVotes)) * 100
                                )}%`
                              : "0%",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18,
                          }}
                          className="h-full rounded-full bg-emerald-600"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-100">
                        {p.votes} vote{p.votes !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <AnimatePresence>
                        {isSelected ? (
                          <motion.svg
                            key="check"
                            initial={{ scale: 0, rotate: -45, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 45, opacity: 0 }}
                            viewBox="0 0 24 24"
                            className="h-7 w-7 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        ) : (
                          <motion.div
                            key="dot"
                            className="h-3 w-3 rounded-full border border-slate-300 bg-white"
                            animate={{
                              boxShadow:
                                pulseId === p.id
                                  ? [
                                      "0 0 0 0 rgba(16,185,129,0.7)",
                                      "0 0 0 12px rgba(16,185,129,0)",
                                    ]
                                  : "0 0 0 0 rgba(0,0,0,0)",
                            }}
                            transition={{ duration: 1.2, repeat: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {pulseId === p.id && (
                        <ConfettiBurst key={`conf-${p.id}`} />
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Tip: Multi-vote mode is enabled. You can vote for multiple people.
              Voting is limited to once per candidate per browser. Use “Reset
              votes” to start over.
            </div>
          </motion.div>
          <div className="flex items-center justify-center">
            <button
              onClick={resetVotes}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-50 active:scale-[.98]"
            >
              Reset votes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = 18;
  const arr = Array.from({ length: pieces });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {arr.map((_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const radius = 90 + Math.random() * 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
            animate={{ x, y, opacity: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm"
            style={{ background: confettiColor(i) }}
          />
        );
      })}
    </div>
  );
}

function confettiColor(i: number) {
  const palette = [
    "#111827",
    "#6EE7B7",
    "#10B981",
    "#93C5FD",
    "#F59E0B",
    "#FCA5A5",
    "#A78BFA",
  ];
  return palette[i % palette.length];
}
