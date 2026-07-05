---
title: Enterprise Test Infrastructure
summary: The cross-platform platform behind the tests — Playwright (web) and Squish (desktop) unified into one execution and reporting ecosystem across Windows, macOS, and Linux.
keywords: [test infrastructure, cross-platform, Squish, desktop testing, Windows, macOS, Linux, CI/CD, flaky detection, reporting, orchestration]
tags: [project, infrastructure, cross-platform, ci-cd]
category: project
project: test-infrastructure
lastUpdated: 2026-07-05
---

## Overview

The platform behind the tests: Playwright (web) and Squish (desktop) unified into one cross-platform execution and reporting ecosystem across Windows, macOS, and Linux. This is a representative model of enterprise work, without proprietary detail.

## Context

Cybersecurity products aren't standard web apps — many are desktop applications that must be validated across three operating systems, which web-only tooling can't cover.

## Approach

Playwright for web and Squish for desktop/Qt GUIs feed a shared orchestration and test-data layer, so a heterogeneous suite reads as one signal to the team. Execution fans out across Windows, macOS, and Linux, then converges into unified reporting and flaky detection.

## Reliability

A flaky-test feedback loop — retry, quarantine, and trend analysis — took the suite from roughly 150 unstable tests to fewer than 20.

## System architecture

Runners (Playwright for web/API, Squish for desktop/Qt) → a shared Orchestration & Test-Data Layer → execution across the Windows / macOS / Linux matrix → Unified Reporting and Flaky Detection.

## CI/CD pipeline

Commit → Build → OS Matrix → Parallel Run → Aggregate → Flaky Gate. This is Son's cross-platform testing and CI/CD infrastructure experience: making a diverse, multi-OS suite behave like a single reliable signal.
