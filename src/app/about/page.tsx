import HeaderText from "@/components/text/HeaderText";
import SubheaderText from "@/components/text/SubheaderText";
import Link from "next/link";

const AboutPage: React.FC = () => {
  const currDate = new Date();
  const birthDate = new Date(2004, 8, 14);
  const diffTime = currDate.getTime() - birthDate.getTime();
  const myAge = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

  return (
    <div>
      <HeaderText>A·bout</HeaderText>
      <div>
        <p>
          Name's Ilan Yashuk, {myAge}. I was born in South Israel, Beersheba. I
          speak, read 'n write in: Hebrew, English and Russian.
        </p>
        <p>
          I always loved to <span className="font-bold">create</span>. I
          iterated through Minecraft redstone, photography, filmmaking and even
          beginner level carpentry. Finally, at 7th class I got into{" "}
          <span className="font-bold">programming</span>. It felt like unlimited
          power in my hands and the potential seemed limitless. I still think
          programming & software might be the easiest way to influence people en
          masse and drive a good change.
        </p>
        <p>
          I like stories. I like complicated subjects and interacting with
          people. I think a man can talk his way out to the biggest of leagues
          only because stories' power. That's why I try to take every
          opportunity I have to meet with people, talk with those who think
          differently than me, go on hiking & travelling adventures.
        </p>
        <p>
          My schedule's always full and even though it gets rough, happines
          comes from having a full todo list and not from striking a line
          through a written goal with a pencil. Happines is the list.
        </p>
      </div>
      <SubheaderText>Projects</SubheaderText>
      <p>
        I've done a lot in the past years. Vids, websites, apps & mode. You can
        read about it in <Link href="/projects">here</Link>.
      </p>
      <SubheaderText>Education</SubheaderText>
      <p>
        <span className="font-bold">Highschool</span>: Very high grades on
        5-unit level tests on (Israel's way of dividing high school subject
        complexity) Math, Physics, English and 10-unit Computer Science.
      </p>
      <p>
        <span className="font-bold">Bonus</span>: I was part of a 3-year
        Computer Science Program made for periphary high school teens. I learned
        and practiced OS systems, C++, Python, Assembly and tackled with a lot
        of self-learning exercises.
      </p>
      <SubheaderText>Sports</SubheaderText>
      <p>
        Sports is a huge part of my life. My mom sent me to sport circles since
        I can remember. Thanks to that, I grew to be good at a huge variaty of
        things. Also, it made sports become a part of my daily routine, without
        any link to motivation or mood. Going on a run for me is exactly like
        brushing my teeth twice a day.
      </p>
      <p>
        Throughout the years I went through swimming, basketball, some soccer,
        tennis and finally: track & field. In 2017, my brother competed at the
        20th Maccabiah games and I thought to myself: "why not me?". So I joined
        track and field.
      </p>
      <p>
        I trained A LOT for the next 7 years. Sometimes close to 20 hours a
        week. I had some ups and downs. In 2019, when I was 14, I broke the
        national record at the 100mH (84cm) 5 times though none of them counted
        as the wind was blowing too fast (sometimes only 0.1 m/s above the
        allowed 2.0 m/s speed). In March of '20 I got injured and didn't fully
        recover until my '23 season. To be honest I think this full recovery is
        my biggest accomplishment. Picking yourself up after such a long time of
        being injured and just turning the wheel: that felt awesome! I went on
        and broke most of my personal records in the '23 season. I ran 11.21 in
        Nationals and jumped 6.75m (6.80w) finishing 7th.
      </p>
      <p>
        To summarize, I gave sports my all while I was in middle to high school.
        I was a good student and well socialized so balancing everything was my
        biggest life lesson. I also gave Israel's track & field the site{" "}
        <Link href="https://visuathlete.com">visuathlete.com</Link>.
      </p>
      <p>
        My dreams and aspirations were bigger than what I've accomplished. I was
        on age-group national podiums lots of times but I always dreamt of being
        on big stages such as the European or World's Championships. I dreamt of
        flying abroad regularly doing the thing I love so much: jumping to a
        sand pit.
      </p>
      <p>
        At the end, enlisting to the army made everything harder and I just
        became too busy and too caught up to advance in a thing that{" "}
        <span className="font-bold">requires all of you</span> and not some of
        you.
      </p>
      <p>
        I still hope to be on the biggest of stages. Sports, Startups,
        Innovation. Something will bring me there.
      </p>
    </div>
  );
};

export default AboutPage;
