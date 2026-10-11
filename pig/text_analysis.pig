-- pig/text_analysis.pig
-- Match Summaries Word Count & Text Mining in Apache Pig

lines = LOAD 'hdfs://localhost:9000/ipl_project/semi_structured/match_summaries.txt' AS (line:chararray);
words = FOREACH lines GENERATE FLATTEN(TOKENIZE(line)) AS word:chararray;
clean_words = FOREACH words GENERATE LOWER(REPLACE(word, '[,.:;!?"\']', '')) AS clean_word:chararray;

-- Keep meaningful words (length >= 4)
filtered_words = FILTER clean_words BY clean_word IS NOT NULL AND SIZE(clean_word) >= 4;

word_groups = GROUP filtered_words BY clean_word;
word_counts = FOREACH word_groups GENERATE group AS word:chararray, COUNT(filtered_words) AS frequency:long;

ordered_counts = ORDER word_counts BY frequency DESC;
top_counts = LIMIT ordered_counts 50;

STORE top_counts INTO 'hdfs://localhost:9000/ipl_project/pig/text_wordcount' USING PigStorage(',');
