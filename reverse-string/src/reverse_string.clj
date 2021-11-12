(ns reverse-string)

(defn reverse-string [s] ;; <- arglist goes here
  (loop [val "", symbs (clojure.string/split s #"")]
        (if (empty? symbs)
          val
          (recur (str val (last symbs)) (drop-last symbs)))))