(ns bob)
(def allChars "\"#№;%:*()-_=+/.,[]{}\n\t\r")

(defn escape-char [s, c]
  (->>
    (filter #(not (= % c)) s)
    (apply str)))

(defn escape-chars [s, ch]
  (loop [ss s esc-charrs ch]
    (if (empty? esc-charrs)
      ss
      (recur (escape-char ss (last esc-charrs)) (drop-last esc-charrs)))))

(defn rage-question? [escapedString, lastChar]
  (and
    (not (= (count escapedString) 0))
    (= escapedString (clojure.string/upper-case escapedString))
    (= lastChar \?)))

(defn question? [escapedString, lastChar]
  (and
    (= lastChar \?)
    (not (= (count escapedString) 1))))

(defn rage? [escapedString]
  (and
    (= escapedString (clojure.string/upper-case escapedString))
    (> (count escapedString) 0)))

(defn escapeString [s]
  (->>
    (escape-chars s allChars)
    (clojure.string/trim)))

(defn response-for [s] ;; <- arglist goes here
  (let [escapedString (escapeString s)
        lettersFromString (clojure.string/join "" (re-seq #"[a-zA-Z]" escapedString))
        lastChar (last escapedString)]
    (cond
      (clojure.string/blank? escapedString) "Fine. Be that way!"
      (rage-question? lettersFromString lastChar) "Calm down, I know what I'm doing!"
      (question? lettersFromString lastChar) "Sure."
      (rage? lettersFromString) "Whoa, chill out!"
      :else "Whatever.")))