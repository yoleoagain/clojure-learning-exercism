(ns bird-watcher)

(def birds-per-day [2 5 0 7 4 1])
(def last-week [0 2 5 3 7 8 4])

(defn today [birds]
  "Check how many birds visited today"
  (last birds))

(defn inc-bird [birds]
  "Increment today's count"
  (update-in birds (vector (- (count birds) 1)) inc))

(defn day-without-birds? [birds]
  "Check if there was a day with no visiting birds"
  (boolean (some zero? birds)))

(defn n-days-count [birds n]
  "Calculate the number of visiting birds for the first number of days"
  (if (>= (count birds) n)
    (reduce + 0 (subvec birds 0 n))
    (reduce + 0 birds)))

(defn busy-days [birds]
  "Calculate the number of busy days"
  (reduce #(if (>= %2 5) (+ %1 1) %1) 0 birds))

(defn odd-week? [birds]
  "Check for odd week"
  (reduce-kv (fn [prev key v]
               (if (odd? (+ key 1))
                 (and (odd? v) prev)
                 (and (= v 0) prev))) true birds))