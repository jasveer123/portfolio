"use client"

import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { motion } from "framer-motion"
import { SectionHeader } from "../ui/section-header"
import { ExternalLink, Briefcase } from "lucide-react"

interface WorkExperience {
    company: string
    role: string
    dateRange: string
    companyUrl?: string
    description: string
    technologies: string[]
}

const experiences: WorkExperience[] = [
    {
        company: "Hashtrust Technologies",
        role: "Software Engineer",
        dateRange: "July 2022 – Present | Gurugram, Haryana",
        companyUrl: "https://hashtrust.com",
        description:
            "Led the development of modern, responsive websites and documentation platforms, improving user engagement through actionable data insights. Enhanced website performance by 30% through API optimizations and server-side migrations. Developed an integrations platform by leveraging dynamic data retrieval, ensuring efficient frontend responsiveness and backend handling. Applied SEO techniques, boosting optimization by approximately 78%. Built a payment gateway with Web3 capabilities, enabling secure token transactions and seamless user interactions. Collaborated with UI/UX teams to deliver pixel-perfect designs and reusable components.",
        technologies: ["NextJs", "ReactJS", "TypeScript", "Javascript", "TailwindCSS", "Framer-motion", "Shadcn", "Framer-motion", "CI/CD", "Docker", "Nodejs", "Expressjs", "Mongodb", "PostgreSQL", "Web3", "API Integration"]
    },
    {
        company: "Celebal Technologies",
        role: "Associate Software Developer",
        dateRange: "Aug 2021 – Mar 2022 | Jaipur, Rajasthan",
        companyUrl: "https://celebaltech.com",
        description:
            "Designed and developed chatbot applications with tailored conversational flows for cognitive search solutions. Created custom interfaces and integrated backend systems to meet client specifications, enhancing user experience. Worked closely with teams to deliver feature-rich updates and streamline application performance.",
        technologies: ["ChatBot Development", "UI/UX Design", "Cognitive Search", "Backend Integration"]
    },
    {
        company: "Hofars",
        role: "Software developer Intern",
        dateRange: "Jun 2019 – Oct 2019 | Remote",
        companyUrl: "https://hofars.com",
        description:
            "Enhanced the main website with new features, ensuring secure access through robust authentication and authorization systems. Developed an HRMS portal dashboard with intuitive, user-friendly interfaces for efficient HR task management, collaborating with teams to deliver impactful solutions.",
        technologies: ["Web Development", "Authentication", "HRMS", "Dashboard UI"]
    },
]

const fadeInUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
}

export default function WorkExperience(): React.ReactElement {

    return (
        <section className="mb-12" id="experience">
            <SectionHeader title="Professional Experience" />
            <Accordion type="multiple" className="space-y-6" defaultValue={experiences.map((_, index) => `item-${index}`)}>
                {experiences.map((exp, index) => (
                    <motion.div
                        key={`experience-${exp.company}-${index}`}
                        initial="initial"
                        animate="animate"
                        variants={fadeInUpVariants}
                        transition={{ delay: index * 0.1 }}
                    >
                        <AccordionItem value={`item-${index}`} className="border-b">
                            <div className="flex flex-col sm:flex-row justify-between items-baseline  sm:items-center w-full mb-2">
                                <div className="text-lg font-medium text-gunmetal flex items-center">
                                    <Briefcase size={20} className="mr-2  text-steelGray" />
                                    {exp.company}
                                    {exp.companyUrl && (
                                        <a
                                            href={exp.companyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex ml-2 text-charcoal"
                                            title="Visit company website"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                                <span className="text-slateGray text-sm">{exp.dateRange}</span>
                            </div>

                            <div className="flex items-center mb-2">
                                <span className="text-steelGray font-medium">{exp.role}</span>
                            </div>

                            <AccordionTrigger className="hover:no-underline py-2">
                                <span className="text-sm text-slateGray">Show details</span>
                            </AccordionTrigger>

                            <AccordionContent>
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="pt-4"
                                >
                                    <p className="mb-4">{exp.description}</p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {exp.technologies.map((tech, techIndex) => (
                                            <span
                                                key={`tech-${techIndex}`}
                                                className="px-2 py-1 text-xs bg-white border text-[13px] border-[#EAECF0] rounded-[8px] text-steelGray"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            </AccordionContent>
                        </AccordionItem>
                    </motion.div>
                ))}
            </Accordion>
        </section>
    )
}