(ns accumulate)

(defn accumulate [f collection]
  (reduce (fn [acc val]
            (conj acc (f val))) [] collection))