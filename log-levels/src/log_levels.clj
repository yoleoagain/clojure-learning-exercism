(ns log-levels
  (:require [clojure.string :as str]))

(def level-pattern #"\[ERROR\]: |\[WARNING\]: |\[INFO\]: ")

(defn clear-all-symbols
  [s]
  (->>
    (str/replace s #"\t|\r|\n|\[|\]|\:" "")
    (str/trim )
    (str/triml)))

(defn message
  "Takes a string representing a log line
   and returns its message with whitespace trimmed."
  [s]
  (clear-all-symbols (str/replace s level-pattern "")))

(defn log-level
  "Takes a string representing a log line
   and returns its level in lower-case."
  [s]
  (->>
    (re-find level-pattern s)
    (clear-all-symbols)
    (str/lower-case)))

(defn reformat
  "Takes a string representing a log line and formats it
   with the message first and the log level in parentheses."
  [s]
  (str (clear-all-symbols (message s)) " " "(" (log-level s) ")"))
