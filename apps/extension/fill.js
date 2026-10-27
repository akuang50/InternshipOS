var AUTOFILL_SKIP = /sponsor|visa|authoriz|work auth|salary|compensation|pay expectation|wage|gender|race|ethnic|veteran|disability|pronoun|eeo|demographic|equal opportunity|voluntary self/i;

function fieldPlan(label, packet) {
  const text = String(label || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!text || !packet) return null;
  if (AUTOFILL_SKIP.test(text)) return { skip: "left blank" };
  const pick = (value) => (value ? { value: String(value) } : { skip: "not on your profile" });
  if (/first.?name|given.?name|\bfname\b/.test(text)) return pick(packet.firstName);
  if (/last.?name|family.?name|surname|\blname\b/.test(text)) return pick(packet.lastName);
  if (/e-?mail/.test(text)) return pick(packet.email);
  if (/phone|mobile|\btel\b/.test(text)) return pick(packet.phone);
  if (/linkedin/.test(text)) return pick(packet.linkedin);
  if (/github/.test(text)) return pick(packet.github);
  if (/portfolio|personal site|website/.test(text)) return pick(packet.website);
  if (/graduat/.test(text)) return pick(packet.graduationYear);
  if (/\bdegree\b/.test(text)) return pick(packet.degree);
  if (/major|discipline|field of study/.test(text)) return pick(packet.major);
  if (/school|university|college/.test(text)) return pick(packet.school);
  if (/cover letter/.test(text)) return pick(packet.coverLetter);
  if (/skill/.test(text)) return pick(packet.skills);
  if (/headline|summary|about you/.test(text)) return pick(packet.headline);
  if (/job title|current title|position title/.test(text)) return pick(packet.currentTitle);
  if (/employer|current company|organization/.test(text) || text === "company") return pick(packet.currentCompany);
  if (/\blocation\b|\bcity\b/.test(text) && !/job location|office location/.test(text)) return pick(packet.location);
  if (/full name|legal name|your name/.test(text) || text === "name") return pick(packet.fullName);
  const answers = packet.answers || [];
  for (let i = 0; i < answers.length; i += 1) {
    const question = String(answers[i].question || "").toLowerCase().trim();
    if (question.length < 12 || !answers[i].answer) continue;
    if (text.includes(question) || question.includes(text)) return { value: answers[i].answer };
  }
  return null;
}
