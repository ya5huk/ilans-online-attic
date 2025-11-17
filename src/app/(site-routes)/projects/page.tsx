import HeaderText from "@/components/text/HeaderText";
import Link from "next/link";
import {
  genJsonLd,
  genMetadata,
  MetadataGenParams,
} from "@/lib/metadata-related";
import { Metadata } from "next";

const pageMetadata = {
  title: "Projects",
  desc: "Projects I made through the years. Websites, apps, software...",
  img: "https://ilansonlineattic.com/projects/visuathlete-showcase.png",
  imgalt: "Biggest project yet - Visuathlete",
  path: "/projects",
  sitetype: "website" as MetadataGenParams["sitetype"],
};

export const metadata: Metadata = genMetadata(pageMetadata);

const ProjectsPage: React.FC = () => {
  interface ProjectInfo {
    title: string;
    period: string;
    description: string;
    image: string;
    tools: string;
    link: string;
  }

  // Remove the https:// from link
  const projects: ProjectInfo[] = [
    {
      title: "Promreach",
      period: "Jun - Aug '25",
      description: `An iOS AI agent chat app that for a user's prompt and from a large bank of APIs - Finds the best APIs for the most relevant answer, authenticates, sets cost-effecient parameters, fetches the data and returns the answer as a chat or graph (line, pie or bar).`,
      tools: "Expo (React Native), Supabase, Openrouter, Tailwind CSS",
      link: "youtube.com/shorts/LfloaCrmXs4",
      image: "/projects/promreach.jpg",
    },
    {
      title: "CalendarPlusAI",
      period: "October '24",
      description: `A tool that upon entering couple of details, generates a custom calendar that fits your needs and availability. The calendar can be exported to your calendar app (Google Calendar, Apple Calendar, Outlook, etc.), PDF or you can receive a daily newsletter with your daily tasks and more. The link is Vercel's because I stopped paying for the calendarplusai.com domain. This project is archived from the publishing perspective.`,
      tools:
        "Nuxt 3 (Vue framework), Google Firebase, ChatGPT API, Tailwind CSS, Python Flask. Deployed on Vercel.",
      link: "motivation-newsletter.vercel.app",
      image: "/projects/calendarplusai.png",
    },
    {
      title: "Visuathlete",
      period: "Jan '23 - Jul '24",
      description: `My first and biggest project thus far. A website made to visualize and analyse all of the results of Israel's athletes, retired and active. The website stores data of more than 1400 athletes about their performances. There's a page for each signed user with beautiful graphs and statistics. It gets updated as they compete. There is a home page feed, a leaderboard, articles, instagram profile for the site and much more. Gets ~400 users monthly.`,
      tools:
        "Nuxt (Vuejs), TypeScript, Tailwind CSS, PostgreSQL, Python, Flask, Vercel, Digital Ocean",
      link: "visuathlete.com",
      image: "/projects/visuathlete-showcase.png",
    },
    {
      title: "EL-ON: Compressed Air Systems",
      period: "Jun '24",
      description: `A website I made for a client that sells compressed air systems in Israel.`,
      tools: "Nuxt 4 (Vue framework), Tailwind CSS, i18n",
      link: "el-on.co.il",
      image: "/projects/el-on-showcase.png",
    },
    {
      title: "SafeCloud",
      period: "Jan - Aug '22",
      description: `My final school project: A cloud focused on speed & simplicity. The cloud called "safe" because of additional security feature that enables a user to encrypt files with a string only he or she knows. Super fast. Super simple. Super secure.`,
      tools: "Python Flask, CryptoJS, Bootstrap",
      link: "",
      image: "/projects/safecloud-showcase.png",
    },
  ];

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(genJsonLd(pageMetadata)),
        }}
        type="application/ld+json"
      ></script>
      <div className="mx-auto">
        <HeaderText>Proj·ects</HeaderText>

        <div className="relative mt-8">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--third)]"></div>

          {projects.map((project, index) => (
            <div key={index} className="relative mb-12 ml-4">
              {/* Timeline dot */}
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-[var(--secondary)] rounded-full border-2 border-white shadow"></div>

              {/* Project card */}
              <div>
                <div>
                  <div className="text-sm font-medium">{project.period}</div>
                  <h3 className="text-2xl font-bold mt-1 mb-3">
                    {project.title}
                  </h3>
                </div>
                <img
                  className="w-full image-shadow"
                  src={project.image}
                  alt={project.title}
                />

                <p className="mt-4 leading-relaxed">{project.description}</p>

                <div className="mb-4">
                  <span className="font-semibold">Tools used: </span>
                  <span className="">{project.tools}</span>
                </div>

                {project.link && (
                  <Link
                    href={`https://${project.link}` || ""}
                    className="link-button"
                  >
                    {project.link}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ProjectsPage;
