# EvoWell AI — Personal Fitness Platform

## Overview

A clean, minimal AI-powered fitness platform that acts as a personal trainer — generating personalized workout and diet plans, tracking progress comprehensively, analyzing exercise form via video uploads, and providing an always-available AI chatbot for fitness questions.

---

## Pages & Features

### 1. Onboarding Questionnaire

- Multi-step form collecting: fitness goals (lose weight, build muscle, etc.), current fitness level, age/height/weight, dietary preferences & restrictions, injuries/ medical issues or limitations, workout frequency preference
- After submission, AI generates an initial personalized workout plan and diet plan

### 2. Dashboard (Home)

- Overview of today's workout and meals
- Quick stats: current weight, streak, upcoming plan adjustments
- Progress summary with mini charts
- Quick access to AI chatbot

### 3. Workout Plan

- Weekly workout schedule with daily exercises
- Each exercise shows: name, sets, reps, rest time, and text-based form tips
- Mark exercises as completed with logging (sets, reps, weight used)
- AI-powered plan rescheduling — after a set period or user request, the AI adjusts the plan based on logged progress

### 4. Diet Plan

- Daily meal plan with breakfast, lunch, dinner, and snacks, if applicable 5-6 meals
- Calorie and macro breakdown per meal and daily totals
- AI adjusts diet based on progress and goals

### 5. Progress Tracking

- **Weight & Measurements**: Log and chart body weight, waist, chest, arms, etc. over time
- **Workout Logs**: History of all workouts with strength progression charts (e.g., bench press over weeks)
- **Progress Photos**: Upload and compare photos side-by-side across dates
- Visual charts and graphs showing trends

### 6. Exercise Form Feedback

- Users upload short video clips of their exercises
- AI analyzes the video and provides detailed text feedback on form: what's correct, what needs improvement, and specific cues to fix issues
- History of past form checks with feedback

### 7. AI Chatbot

- Persistent chat interface accessible from any page
- Users can ask any fitness, nutrition, or health question
- Context-aware — the bot knows the user's plan, goals, and progress
- Streaming responses for a smooth conversational experience

### 8. Profile & Settings

- Edit personal info and preferences
- Update goals and fitness level
- View and manage account

---

## Backend & AI

- **Lovable Cloud** for backend infrastructure
- **Lovable AI Gateway** (Gemini) for all AI features: plan generation, plan adjustments, form analysis, and chatbot
- **Supabase Storage** for progress photos and exercise videos
- **User accounts** with authentication so all data persists

---

## Design

- Clean, minimal light theme
- Simple typography with clear hierarchy
- Subtle accent color for actions and progress indicators
- Mobile-friendly responsive layout
- Card-based UI for workouts, meals, and progress entries