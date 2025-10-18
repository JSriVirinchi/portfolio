from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Experience(BaseModel):
    company: str
    title: str
    location: Optional[str]
    start: str
    end: str
    focus: Optional[str]
    highlights: List[str] = Field(default_factory=list)


class Education(BaseModel):
    school: str
    degree: str
    location: Optional[str]
    period: str
    gpa: Optional[str]
    coursework: List[str] = Field(default_factory=list)


class SkillItem(BaseModel):
    name: str
    icon: Optional[str] = None


class Skills(BaseModel):
    languages: List[SkillItem] = Field(default_factory=list)
    frameworks: List[SkillItem] = Field(default_factory=list)
    cloud: List[SkillItem] = Field(default_factory=list)
    tools: List[SkillItem] = Field(default_factory=list)


class SpotlightItem(BaseModel):
    title: str
    description: str
    image: str


class TimelineItem(BaseModel):
    year: str
    label: str
    description: str


class Profile(BaseModel):
    name: str
    headline: str
    location: Optional[str]
    email: EmailStr
    phone: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    resume: Optional[str]
    summary: str
    specialties: List[str] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: Skills
    spotlight: List[SpotlightItem] = Field(default_factory=list)
    timeline: List[TimelineItem] = Field(default_factory=list)


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=2000)


class ContactResponse(BaseModel):
    status: str
    timestamp: datetime


class GithubRepo(BaseModel):
    name: str
    description: Optional[str]
    html_url: str
    homepage: Optional[str]
    stargazers_count: int
    language: Optional[str]
    topics: List[str] = Field(default_factory=list)
    updated_at: datetime


class GithubReposResponse(BaseModel):
    query: Optional[str]
    results: List[GithubRepo]
