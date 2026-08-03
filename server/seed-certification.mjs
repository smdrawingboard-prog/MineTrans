import { getDb } from "./db.ts";
import { courses, courseSections, quizzes, quizQuestions } from "../drizzle/schema.ts";

const db = await getDb();

if (!db) {
  console.error("Database not available");
  process.exit(1);
}

// Create a sample course
const courseData = {
  title: "Mining Insurance Underwriting Certification",
  description: "Master the 12-step Business Interruption methodology and mining insurance underwriting",
  totalSections: 3,
};

const courseResult = await db.insert(courses).values(courseData);
const courseId = courseResult[0]?.insertId || 1;

console.log(`Created course with ID: ${courseId}`);

// Create sections
const sectionsData = [
  {
    courseId,
    sectionNumber: 1,
    title: "Introduction to Business Interruption",
    content: `
      <h3>What is Business Interruption Insurance?</h3>
      <p>Business Interruption (BI) insurance protects companies from financial losses when operations are interrupted due to covered perils.</p>
      
      <h4>Key Concepts:</h4>
      <ul>
        <li><strong>Gross Profit:</strong> Revenue minus variable costs</li>
        <li><strong>Waiting Period:</strong> Time before coverage begins</li>
        <li><strong>Indemnity Period:</strong> Maximum coverage duration</li>
        <li><strong>Single Point of Failure:</strong> Critical equipment or process</li>
      </ul>
      
      <h4>Why BI Insurance Matters in Mining:</h4>
      <p>Mining operations have high fixed costs and long lead times for equipment replacement. A single breakdown can cost millions in lost production.</p>
    `,
    order: 1,
  },
  {
    courseId,
    sectionNumber: 2,
    title: "The 12-Step BI Methodology",
    content: `
      <h3>Understanding the 12-Step Process</h3>
      <p>The MineTrans 12-step methodology provides a systematic approach to quantifying BI exposure:</p>
      
      <ol>
        <li><strong>Identify Revenue Streams:</strong> Map all income sources</li>
        <li><strong>Calculate Gross Profit:</strong> Revenue minus variable costs</li>
        <li><strong>Identify Critical Equipment:</strong> Single points of failure</li>
        <li><strong>Determine Lead Times:</strong> Replacement timeframes</li>
        <li><strong>Quantify Fixed Costs:</strong> Ongoing expenses during outage</li>
        <li><strong>Map Supply Chains:</strong> Dependent suppliers and customers</li>
        <li><strong>Assess Resilience:</strong> Backup systems and redundancy</li>
        <li><strong>Calculate Maximum Loss:</strong> Worst-case scenario</li>
        <li><strong>Determine Waiting Period:</strong> Deductible equivalent</li>
        <li><strong>Set Indemnity Period:</strong> Coverage duration</li>
        <li><strong>Structure Limits:</strong> Coverage amounts per exposure</li>
        <li><strong>Document Assumptions:</strong> Key variables and constraints</li>
      </ol>
    `,
    order: 2,
  },
  {
    courseId,
    sectionNumber: 3,
    title: "Mining-Specific Risk Assessment",
    content: `
      <h3>Mining Industry Challenges</h3>
      <p>Mining operations face unique BI risks specific to Sub-Saharan Africa:</p>
      
      <h4>Common Exposures:</h4>
      <ul>
        <li>Tailings dam failures and geotechnical events</li>
        <li>Machinery and equipment breakdowns</li>
        <li>Power supply interruptions</li>
        <li>Water supply disruptions</li>
        <li>Supply chain interruptions</li>
        <li>Environmental and regulatory shutdowns</li>
        <li>Political and security risks</li>
      </ul>
      
      <h4>Sub-Saharan Africa Considerations:</h4>
      <ul>
        <li>Limited equipment availability and long lead times</li>
        <li>Infrastructure vulnerabilities</li>
        <li>Regulatory compliance requirements</li>
        <li>Currency and political risks</li>
        <li>Specialized expertise availability</li>
      </ul>
    `,
    order: 3,
  },
];

for (const section of sectionsData) {
  const result = await db.insert(courseSections).values(section);
  console.log(`Created section: ${section.title}`);
}

// Create a quiz for the course
const quizData = {
  courseId,
  sectionId: 1,
  title: "Section 1 Quiz: Introduction to BI",
  passingScore: 70,
};

const quizResult = await db.insert(quizzes).values(quizData);
const quizId = quizResult[0]?.insertId || 1;

console.log(`Created quiz with ID: ${quizId}`);

// Create quiz questions
const questionsData = [
  {
    quizId,
    questionText: "What does BI insurance protect against?",
    questionType: "multiple_choice",
    options: JSON.stringify([
      "Financial losses from operational interruptions",
      "Physical damage to buildings",
      "Employee injuries",
      "Customer lawsuits",
    ]),
    correctAnswer: "Financial losses from operational interruptions",
    order: 1,
  },
  {
    quizId,
    questionText: "In a mining operation with $10M revenue and $6M variable costs, what is the gross profit?",
    questionType: "calculation",
    options: JSON.stringify(["$4M", "$6M", "$10M", "$16M"]),
    correctAnswer: "$4M",
    order: 2,
  },
  {
    quizId,
    questionText: "Which of the following is NOT a common mining BI exposure?",
    questionType: "multiple_choice",
    options: JSON.stringify([
      "Tailings dam failure",
      "Machinery breakdown",
      "Office furniture damage",
      "Power supply interruption",
    ]),
    correctAnswer: "Office furniture damage",
    order: 3,
  },
];

for (const question of questionsData) {
  await db.insert(quizQuestions).values(question);
  console.log(`Created question: ${question.questionText}`);
}

console.log("\n✓ Database seeding complete!");
console.log(`Created course: ${courseData.title}`);
console.log(`Created ${sectionsData.length} sections`);
console.log(`Created quiz with ${questionsData.length} questions`);
