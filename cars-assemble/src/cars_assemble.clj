(ns cars-assemble)

(def cars-per-hour 221)

(defn p-in-h-rate [h]
  "Getting percentage rate per hour"
  (cond
    (= h 0) 0
    (<= 1 h 4) 100
    (<= 5 h 8) 90
    (= h 9) 80
    (= h 10) 77
    :else 0))

(defn production-rate
  "Returns the assembly line's production rate per hour,
   taking into account its success rate"
  [speed]
  (float
    (* (/ (* cars-per-hour speed) 100) (p-in-h-rate speed))))

(defn working-items
  "Calculates how many working cars are produced per minute"
  [speed]
  (int (/ (production-rate speed) 60)))