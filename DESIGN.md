---
version: alpha
name: "승계브릿지 Strike-Inspired System"
description: "A warm, trustworthy M&A succession visual system inspired by Japanese advisory-site structure without copying third-party assets."
colors:
  primary: "#F28C22"
  primaryDark: "#B85A00"
  trustBlue: "#123F8C"
  trustBlueDark: "#08275E"
  ink: "#182230"
  body: "#485568"
  cream: "#FFF8EF"
  blueSoft: "#EEF5FF"
  surface: "#FFFFFF"
  line: "#E6E0D8"
typography:
  display:
    fontFamily: "Pretendard, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: 54px
    fontWeight: 900
    lineHeight: 1.18
    letterSpacing: 0px
  sectionTitle:
    fontFamily: "Pretendard, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: 38px
    fontWeight: 900
    lineHeight: 1.28
    letterSpacing: 0px
  body:
    fontFamily: "Pretendard, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.7
    letterSpacing: 0px
rounded:
  sm: 4px
  md: 8px
  pill: 999px
spacing:
  xs: 8px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 56px
components:
  primaryButton:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 26px"
    height: 60px
  serviceCard:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 28px
---

## Overview

승계브릿지는 60대 이상 중소기업 대표가 “믿고 첫 상담을 맡길 수 있다”고 느끼는 것이 우선이다. Strike의 정보 구조에서 배운 점은 큰 실사 히어로, 빠른 상담 CTA, 반복되는 신뢰 근거, 서비스/사례 카드 리듬이다. 색상은 오렌지를 행동 색으로 쓰고, 블루는 제도권 신뢰를 보조한다.

## Colors

`{colors.primary}` is the main consultation action. `{colors.trustBlue}` is used for secondary valuation and case-status surfaces. `{colors.cream}` keeps the page warm without turning beige-heavy.

## Typography

Large Korean headlines should be direct and calm. Body text must stay at least 18px for senior executives, with generous line height and no negative letter spacing.

## Layout

Use a top header, announcement strip, full-width hero, then repeated trust/service sections. Fixed-format cards use stable grid tracks and 8px radius.

## Elevation & Depth

Use subtle warm shadows only for repeated cards and floating CTA blocks. Avoid ornamental depth.

## Shapes

Cards and buttons use 8px radius. Pills are reserved for status labels and trust badges.

## Components

Primary CTAs are orange. Secondary CTAs and case/status blocks use trust blue. Service cards use a thin orange top rule and strong numbering.

## Do's and Don'ts

Do use original project imagery, clear consultation routes, and readable financial summaries.

Don't copy Strike assets, use navy as the dominant theme, or add decorative elements without a service role.
