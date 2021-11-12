(ns bob)
(def allChars "\"#№;%:*()-_=+/.,[]{}\n\t\r")

(defn escape-char [s, c]
  (->>
    (clojure.string/split s #"")
    (filter #(not (= % c)))
    (apply str)))

(defn escape-chars [s, ch]
  (loop [ss s esc-charrs ch]
    (if (empty? esc-charrs)
      ss
      (recur (escape-char ss (last esc-charrs)) (drop-last esc-charrs)))))

(defn isRageQuestion [escapedString, lastChar]
  (and
    (not (= (count escapedString) 0))
    (= escapedString (clojure.string/upper-case escapedString))
    (= lastChar \?)))

(defn isQuestion [escapedString, lastChar]
  (and
    (= lastChar \?)
    (not (= (count escapedString) 1))))

(defn isRage [escapedString, lastChar]
  (and
    (= escapedString (clojure.string/upper-case escapedString))
    (> (count escapedString) 0)))

(defn escapeString [s]
  (->>
    (escape-chars s (clojure.string/split allChars #""))
    (clojure.string/trim)))

(defn response-for [s] ;; <- arglist goes here
  (def escapedString (escapeString s))
  (def lettersFromString (clojure.string/join "" (re-seq #"[a-zA-Z]" escapedString)))
  (def lastChar (last escapedString))

  (if (clojure.string/blank? escapedString)
    "Fine. Be that way!"
    (if (isRageQuestion lettersFromString lastChar)
      "Calm down, I know what I'm doing!"
      (if (isQuestion lettersFromString lastChar)
        "Sure."
        (if (isRage lettersFromString lastChar)
          "Whoa, chill out!" "Whatever.")))))