import { describe, it, expect, beforeAll } from 'vitest';
import { promises as fs } from 'fs';
import { Parser } from 'xml2js';
import path from 'path';

describe('GODMODE_AGENT_BLUEPRINT.xml Schema Validation', () => {
  let xmlContent: any;

  beforeAll(async () => {
    const xmlPath = path.resolve(process.cwd(), '../../docs/GODMODE_AGENT_BLUEPRINT.xml');
    const fileContent = await fs.readFile(xmlPath, 'utf-8');
    const parser = new Parser();
    xmlContent = await parser.parseStringPromise(fileContent);
  });

  it('should have a root element named AgentKnowledgeBase', () => {
    expect(xmlContent).toBeDefined();
    expect(xmlContent['xs:schema']['xs:element'][0].$.name).toBe('AgentKnowledgeBase');
  });

  it('should have AgentProfile, CognitiveArchitecture, KnowledgeRepresentation, and GovernanceFramework as direct children of AgentKnowledgeBase', () => {
    const agentKnowledgeBase = xmlContent['xs:schema']['xs:element'][0]['xs:complexType'][0]['xs:sequence'][0]['xs:element'];
    const elementNames = agentKnowledgeBase.map((el: any) => el.$.name);
    expect(elementNames).toContain('AgentProfile');
    expect(elementNames).toContain('CognitiveArchitecture');
    expect(elementNames).toContain('KnowledgeRepresentation');
    expect(elementNames).toContain('GovernanceFramework');
  });
});
