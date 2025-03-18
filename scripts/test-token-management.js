/**
 * Test script for token management with Groq
 * 
 * This script tests the combination of ConversationManager and GroqClient
 * to demonstrate how to handle large conversations without hitting rate limits.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import GroqClient from '../lib/groq-client.js';
import ConversationManager from '../lib/conversation-manager.js';

// Sample conversation to test with
const CONVERSATION_TURNS = [
  { role: 'user', content: 'Tell me about artificial intelligence and its history.' },
  { role: 'assistant', content: 'Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think and learn like humans. The term was coined in 1956 at the Dartmouth Conference, led by John McCarthy, who defined it as "the science and engineering of making intelligent machines."\n\nThe history of AI can be broken down into several key periods:\n\n1. Early Beginnings (1940s-1950s): The theoretical foundations were laid by mathematicians like Alan Turing, who proposed the Turing Test in 1950 as a measure of machine intelligence.\n\n2. Birth of AI (1950s-1960s): The field was formally established at the Dartmouth Conference in 1956. Early successes included the Logic Theorist program by Allen Newell and Herbert A. Simon, which could prove mathematical theorems.\n\n3. First AI Winter (1970s): After initial optimism, funding and interest decreased due to limitations in computing power and algorithms.\n\n4. Expert Systems Era (1980s): A resurgence occurred with rule-based expert systems that could solve domain-specific problems.\n\n5. Second AI Winter (late 1980s-early 1990s): Again, enthusiasm waned as expert systems proved difficult to scale and maintain.\n\n6. Machine Learning Revolution (1990s-2000s): Statistical approaches and machine learning algorithms gained prominence.\n\n7. Deep Learning Breakthrough (2010s-Present): With increased computational power, big data availability, and advances in neural network architectures, deep learning has enabled remarkable progress in areas like computer vision, natural language processing, and reinforcement learning.\n\nToday, AI is widely applied across industries, from healthcare and finance to transportation and entertainment. The field continues to evolve rapidly, with ongoing research in areas like explainable AI, ethical AI, and artificial general intelligence.' },
  { role: 'user', content: 'What are the main approaches to artificial intelligence?' },
  { role: 'assistant', content: 'There are several main approaches to artificial intelligence, each with different philosophies, methodologies, and applications:\n\n1. **Symbolic AI (Classical AI)**:\n   - Based on symbolic representations of problems, knowledge, and logic\n   - Uses rule-based systems and explicit knowledge representation\n   - Examples: Expert systems, logic programming, knowledge graphs\n   - Strengths: Explainability, reasoning with explicit rules\n   - Limitations: Difficulty handling uncertainty, brittleness in novel situations\n\n2. **Machine Learning**:\n   - Statistical approach where systems learn patterns from data\n   - Subdivided into supervised, unsupervised, and reinforcement learning\n   - Examples: Decision trees, random forests, support vector machines\n   - Strengths: Ability to find patterns in data, generalization\n   - Limitations: Requires large datasets, may struggle with causality\n\n3. **Deep Learning**:\n   - Based on artificial neural networks with multiple layers\n   - Automatically learns hierarchical feature representations\n   - Examples: Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), Transformers\n   - Strengths: Powerful pattern recognition, handling unstructured data\n   - Limitations: Requires massive datasets, computational intensity, black-box nature\n\n4. **Evolutionary Computation**:\n   - Inspired by biological evolution\n   - Uses mechanisms like mutation, selection, and reproduction\n   - Examples: Genetic algorithms, genetic programming\n   - Strengths: Optimization of complex problems, creating novel solutions\n   - Limitations: Computationally expensive, non-deterministic\n\n5. **Bayesian Methods**:\n   - Based on probabilistic inference and Bayes\' theorem\n   - Explicitly models uncertainty in reasoning\n   - Examples: Bayesian networks, probabilistic programming\n   - Strengths: Handling uncertainty, incorporating prior knowledge\n   - Limitations: Computational complexity for large models\n\n6. **Hybrid Approaches**:\n   - Combinations of multiple AI techniques\n   - Examples: Neuro-symbolic AI, combining neural networks with symbolic reasoning\n   - Strengths: Leverages advantages of different approaches\n   - Current research frontier: Integrating learning and reasoning\n\n7. **Embodied AI and Robotics**:\n   - Focus on intelligence manifested in physical systems\n   - Emphasizes sensorimotor interactions with environment\n   - Examples: Autonomous robots, self-driving cars\n   - Strengths: Grounding AI in real-world interactions\n\nRecent trends show increasing integration between these approaches, with large language models like GPT combining aspects of deep learning with emergent reasoning capabilities, and growing interest in neuro-symbolic methods that bridge connectionist and symbolic AI.\n\nThe field continues to evolve rapidly, with researchers pursuing multiple paths toward more capable, robust, and trustworthy AI systems.' },
  { role: 'user', content: 'What are the ethical concerns with advanced AI?' },
  { role: 'assistant', content: 'Ethical concerns with advanced AI span numerous dimensions, becoming increasingly urgent as AI systems grow more capable and pervasive:\n\n1. **Bias and Fairness**:\n   - AI systems can perpetuate or amplify existing societal biases in their training data\n   - Unfair outcomes in critical domains like hiring, lending, criminal justice, and healthcare\n   - Challenge: Defining fairness mathematically and across different cultural contexts\n\n2. **Privacy and Surveillance**:\n   - AI enables unprecedented capabilities for monitoring and analyzing personal data\n   - Facial recognition and other biometric systems raise surveillance concerns\n   - Data collection practices often lack transparency and meaningful consent\n\n3. **Autonomy and Human Decision-Making**:\n   - Risk of over-reliance on algorithmic recommendations, diminishing human judgment\n   - Questions about appropriate levels of AI involvement in consequential decisions\n   - Tension between automation benefits and maintaining human control\n\n4. **Transparency and Explainability**:\n   - Many advanced AI systems (especially deep learning) operate as "black boxes"\n   - Difficulty explaining AI decisions can undermine accountability and trust\n   - Critical in high-stakes domains like medicine, law, and finance\n\n5. **Job Displacement and Economic Inequality**:\n   - Automation of tasks across skill levels, potentially displacing workers\n   - Benefits of AI productivity may be concentrated among technology owners\n   - Need for education, retraining, and potential social policy responses\n\n6. **Safety and Alignment**:\n   - Ensuring AI systems behave as intended without harmful unexpected behaviors\n   - Particularly important for increasingly autonomous systems\n   - Challenge of specifying human values and intentions completely and correctly\n\n7. **Lethal Autonomous Weapons**:\n   - AI enables weapons that could select and engage targets without human intervention\n   - Raises profound questions about human dignity and moral responsibility in warfare\n   - Ongoing international debate about appropriate regulation or prohibition\n\n8. **Concentration of Power**:\n   - Advanced AI development requires massive computational resources and data\n   - Risk of AI capabilities being concentrated among a few corporations or governments\n   - Implications for democracy, competition, and global power dynamics\n\n9. **Misinformation and Manipulation**:\n   - AI can generate convincing synthetic media (deepfakes) and text\n   - Potential for large-scale manipulation of information ecosystems\n   - Challenge to social trust and informed democratic discourse\n\n10. **Long-term and Existential Concerns**:\n    - Potential risks from highly advanced AI systems surpassing human capabilities\n    - Questions about control, value alignment, and long-term governance\n    - Balancing innovation with appropriate caution and oversight\n\n11. **Environmental Impact**:\n    - Training large AI models requires significant energy consumption\n    - Growing carbon footprint of AI deployment and data centers\n    - Need for sustainable AI development practices\n\nAddressing these concerns requires multidisciplinary collaboration between technologists, ethicists, policymakers, and diverse stakeholders. Various approaches include technical solutions (like fairness algorithms and explainable AI), policy and regulatory frameworks, institutional oversight, and embedding ethical considerations throughout the AI development lifecycle. The field of AI ethics continues to evolve alongside technological capabilities, aiming to ensure AI benefits humanity while minimizing harm.' },
];

async function testTokenManagement() {
  console.log('Testing token management with Groq...');

  try {
    // Check if API key is available
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    // Initialize components
    const groqClient = new GroqClient();
    const conversationManager = new ConversationManager({
      systemMessage: "You are a helpful AI assistant specializing in explaining complex topics clearly and concisely.",
      maxConversationTokens: 3000 // Set lower for testing purposes
    });

    // Add the sample conversation to the manager
    CONVERSATION_TURNS.forEach(turn => {
      conversationManager.addMessage(turn.role, turn.content);
    });

    // Display conversation stats
    const messageCount = conversationManager.messages.length;
    const tokenCount = conversationManager.getTokenCount();
    console.log(`Loaded conversation with ${messageCount} messages and approximately ${tokenCount} tokens`);

    // Add a new user message that would trigger summarization
    console.log('\nAdding a new message that will trigger conversation summarization...');
    conversationManager.addUserMessage(
      "Can you explain the difference between narrow AI and artificial general intelligence, " +
      "and when experts think we might achieve AGI? Also, what are the main safety concerns " +
      "researchers have about advanced AI systems and how might they be addressed?"
    );

    // Check if summarization happened
    const newMessageCount = conversationManager.messages.length;
    const newTokenCount = conversationManager.getTokenCount();
    console.log(`After potential summarization: ${newMessageCount} messages and ${newTokenCount} tokens`);

    // Send the conversation to Groq
    console.log('\nSending conversation to Groq...');
    const startTime = Date.now();
    const response = await groqClient.chat(conversationManager.getMessages());
    const duration = Date.now() - startTime;

    // Output response
    console.log(`\nResponse received in ${duration}ms:`);
    console.log('-----------------------------------');
    console.log(response.content);
    console.log('-----------------------------------');

    // Add the response to the conversation
    conversationManager.addAssistantMessage(response.content);

    // Display final stats
    console.log(`\nFinal conversation state: ${conversationManager.messages.length} messages and ${conversationManager.getTokenCount()} tokens`);
    console.log('Remaining tokens in current window:', groqClient.tokenLimiter.getRemainingTokens());

    console.log('\nToken management test completed successfully! ✅');

  } catch (error) {
    console.error('❌ Error during token management test:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run the test
testTokenManagement().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 