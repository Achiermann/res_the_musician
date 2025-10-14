ONLY follow the following instructions if explicitly told:

<!-- .1 Task -->

## past shows

in the ".container"-div after ".gigs-list" create a h2 reading "past concerts" followed by a div ".past-gigs-list" and have all shows/concerts/events (these are all synonyms) from the useGigsStore.gigs that have the date after the current date displayed there, in the same format as in 
".gigs-list" use the same classNames, add "past-show" or similar if necessary.

## new data

also return a sql-command so i can put the following data in the DB "concerts" schema: "resresres"

Data to push is the following. explanation of the rows:
1.row reading "I WAS THERE" should be ignored, do nothing with that
2.row reading a date is the date (pay attention to formatting)
3.row reads the act (column "act")
4.row reads should go to the column "comments"
5.row before the first "," should go to column "venue"
5.row after the first "," should go to column "location"
for column start use "20:00"
for culumn end use "23:00"

"
I WAS THERE
Saturday 17 October 2020
Soybomb
with Kitty Solaris
Kesselhaus in der Kulturbrauerei, Berlin, Germany

I WAS THERE
Saturday 22 February 2020
Soybomb
with Joshua Zero
The Finsbury, London, UK

I WAS THERE
Friday 21 February 2020
Soybomb
with Joshua Zero
Cafe Totem, Sheffield, UK

I WAS THERE
Thursday 20 February 2020
Soybomb
with Joshua Zero
Wharf Chambers, Leeds, UK

I WAS THERE
Tuesday 18 February 2020
Soybomb
with Joshua Zero
Zanzibar, Liverpool, UK

I WAS THERE
Monday 17 February 2020
Soybomb
with Joshua Zero
Small Seeds, Huddersfield, UK

I WAS THERE
Saturday 15 February 2020
Soybomb
with Joshua Zero
Mr Wolf's, Bristol, UK

I WAS THERE
Friday 14 February 2020
Soybomb
with Joshua Zero
Lamplighter, Northampton, UK

I WAS THERE
Thursday 13 February 2020
Soybomb
with Joshua Zero
The Cavendish Arms, London, UK

I WAS THERE
Saturday 21 December 2019
Soybomb
Theater Rampe, Stuttgart, Germany

I WAS THERE
Monday 02 December 2019
Soybomb
Valentin Stüberl, Berlin, Germany

I WAS THERE
Saturday 16 November 2019
Soybomb
Urban Spree, Berlin, Germany

I WAS THERE
Friday 15 November 2019
Soybomb
Lindwurm, Hannover, Germany

I WAS THERE
Thursday 14 November 2019
Soybomb
Studio Ost, Brunswick, Germany

I WAS THERE
Wednesday 13 November 2019
Soybomb
Café Roland, Pforzheim, Germany

I WAS THERE
Saturday 09 November 2019
Soybomb
Le Pressoir, Morges, Switzerland

I WAS THERE
Friday 08 November 2019
Soybomb
Café Kairo, Bern, Switzerland

I WAS THERE
Thursday 07 November 2019
Soybomb
La Parenthèse, Nyon, Switzerland

I WAS THERE
Wednesday 06 November 2019
Soybomb
Albani, Winterthur, Switzerland

I WAS THERE
Tuesday 05 November 2019
Soybomb
Zug, Switzerland

I WAS THERE
Saturday 02 November 2019
Soybomb
Inch Club, Fiesch, Switzerland

I WAS THERE
Friday 01 November 2019
Soybomb
with Howlong Wolf
Royal Baden, Baden, Switzerland

I WAS THERE
Thursday 31 October 2019
Soybomb
Off Bar, Basel, Switzerland

I WAS THERE
Wednesday 30 October 2019
Soybomb
Flint, Ludwigsburg, Germany

I WAS THERE
Monday 28 October 2019
Soybomb
Goldene Krone, Darmstadt, Germany

I WAS THERE
Sunday 27 October 2019
Soybomb
Loch, Wuppertal, Germany

I WAS THERE
Saturday 26 October 2019
Soybomb
Dein Hotel Europa, Aachen, Germany

I WAS THERE
Friday 25 October 2019
Soybomb
MS Loretta, Celle, Germany

I WAS THERE
Thursday 24 October 2019
Soybomb
Noch Besser Leben, Leipzig, Germany

I WAS THERE
Wednesday 23 October 2019
Soybomb
Riesa Efau, Dresden, Germany

I WAS THERE
Saturday 25 May 2019
Soybomb
Magdeburg, Germany

I WAS THERE
Saturday 18 May 2019
Soybomb
Bar Bobu, Berlin, Germany

I WAS THERE
Wednesday 08 May 2019
Soybomb
Pooca Bar, Hamburg, Germany

I WAS THERE
Monday 06 May 2019
Soybomb
Blue Note Club & Bar, Dresden, Germany

I WAS THERE
Friday 03 May 2019
Soybomb
Polyester Klub, Oldenburg, Germany

I WAS THERE
Thursday 02 May 2019
Soybomb
Heldenbar, Bremen, Germany

I WAS THERE
Tuesday 30 April 2019
Soybomb
Geissweg Klimperkasten, Tübingen, Germany

I WAS THERE
Monday 29 April 2019
Soybomb
Rakete, Stuttgart, Germany

I WAS THERE
Friday 26 April 2019
Soybomb
Altes Spital, Viechtach, Germany

I WAS THERE
Wednesday 24 April 2019
Soybomb
with Reiche Söhne
Bahnwärter Thiel, Munich, Germany

I WAS THERE
Sunday 07 April 2019
Soybomb
Garibaldi Hotel, Northampton, UK

I WAS THERE
Friday 05 April 2019
Soybomb
with Ay Wing and CHINCHILLA (UK)
The Finsbury, London, UK

I WAS THERE
Saturday 30 March 2019
Soybomb
Kellertheater im Vogelsang, Altdorf, Switzerland

I WAS THERE
Friday 29 March 2019
Soybomb
with IKAN HYU
Galvanik, Zug, Switzerland

I WAS THERE
Thursday 28 March 2019
Soybomb
Piccadilly, Brugg, Switzerland

I WAS THERE
Tuesday 26 March 2019
Soybomb
Helsinki, Zürich, Switzerland

I WAS THERE
Saturday 23 March 2019
Soybomb
Cuadro22, Chur, Switzerland

I WAS THERE
Friday 22 March 2019
Soybomb
Gaswerk, Winterthur, Switzerland

I WAS THERE
Thursday 21 March 2019
Soybomb
with Dachs
Konzerthaus Schüür, Luzern, Switzerland"

create table resresres.concerts (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  act character varying not null,
  date date not null,
  venue character varying not null,
  location character varying not null,
  comments text not null,
  status text not null,
  start time without time zone null,
  "end" time without time zone null,
  url text null,
  constraint concerts_pkey primary key (id)
) TABLESPACE pg_default;

<!-- .2 Disclaimer -->

Don`t make any other changes then the ones explicitly mentioned here or in any of the mentioned instruction-files.
Follow DECISIONS.md, CLAUDE.md, STYLE-GUIDE.md
