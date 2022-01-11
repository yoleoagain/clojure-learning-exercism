(ns interest-is-interesting)

(defn interest-rate
  "TODO: add docstring"
  [balance]
  (let [double-balance (bigdec balance)]
    (double
      (cond
        (< double-balance 0) -3.213
        (and (>= double-balance 0) (< double-balance 1000)) 0.5
        (and (>= double-balance 1000) (< double-balance 5000)) 1.621
        (>= double-balance 5000) 2.475
        :else 0))))

(defn percentage-from-sum [sum percent] (bigdec (/ (* sum percent) 100)))

(defn truncate-zeros
  [balance]
  (bigdec
    (clojure.string/join
      (reverse
        (drop-while #(= % \0 ) (reverse (str balance)))) )))

(defn annual-balance-update
  "TODO: add docstring"
  [balance]
  (let [rate (interest-rate balance)
        rate-in-money (percentage-from-sum balance rate)]
    (bigdec
      (truncate-zeros
        (clojure.string/replace
          (format "%.20f"
            (+ balance (* rate-in-money (if (neg? rate) -1 1)))) \, \.)))))

(defn amount-to-donate
  "TODO: add docstring"
  [balance tax-free-percentage]
  (let [balance-double (bigdec balance)
        perc-from-sum (percentage-from-sum balance tax-free-percentage)]
    (int
      (Math/floor
        (cond
          (= balance-double 0) 0
          (> balance-double 0) (* perc-from-sum 2)
          :else 0)))))