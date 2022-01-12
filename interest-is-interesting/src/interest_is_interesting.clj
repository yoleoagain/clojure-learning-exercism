(ns interest-is-interesting)

(defn interest-rate
  "TODO: add docstring"
  [balance]
  (cond
    (< balance 0.0M) -3.213
    (< balance 1000.0M) 0.5
    (< balance 5000.0M) 1.621
    :else 2.475))

(defn percentage-from-sum [sum percent] (bigdec (/ (* sum (bigdec percent)) 100)))

(defn annual-balance-update
  "TODO: add docstring"
  [balance]
  (let [rate (interest-rate balance)
        rate-in-money (percentage-from-sum balance rate)]
   (+ balance (* rate-in-money (if (neg? rate) -1M 1M)))))

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