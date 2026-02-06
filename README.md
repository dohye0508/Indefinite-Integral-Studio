# ISHS_Lab
> **The Next-Generation Integrated Academic Platform**
> *초개인화 학습 경험과 통합 개발 환경의 만남*

![Status](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-2.5.0_Integb-blue) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 프로젝트 비전

**ISHS_Lab**은 단순한 학습 도구를 넘어선, 공학적 정밀함과 교육적 통찰이 결합된 **최첨단 통합 학술 플랫폼**입니다.
본 프로젝트는 **"학습의 몰입(Flow)을 위한 완벽한 환경"**이라는 철학 하에 설계되었으며, 수학적 엄밀성, 언어적 확장성, 그리고 컴퓨터 공학적 실용성을 하나의 유려한 인터페이스 안에 담아냈습니다.

사용자는 ISHS_Lab을 통해 미적분학의 심연을 탐구하고, 언어의 장벽을 넘어서며, 코드로 세상을 제어하는 경험을 하게 될 것입니다. 이 모든 과정은 **ISHS 32nd**의 장인 정신으로 빚어낸 **Deep Dark Mode** 시스템과 **Responsive UI/UX** 위에서 매끄럽게 동작합니다.

---

## 핵심 모듈

ISHS_Lab은 세 가지의 강력한 독립 스튜디오로 구성되어 있으며, 현재 **Integral Studio**를 중심으로 운영되고 있습니다.

### 1. Integral Studio (Indefinite Integral Training)
> *알고리즘이 설계하는 무한의 적분 우주*

Integral Studio는 본 플랫폼의 기원이자 핵심 엔진입니다. 정적인 문제 은행 방식을 탈피하여, 독자적 알고리즘과 **Python SymPy** 엔진이 실시간으로 결합되어 **무한대에 가까운 부정적분 문제**를 생성합니다.

-   **Dynamic Problem Generation (DPG)**: 단순 난수 생성이 아닌, 교육적 가치가 검증된 함수 구조 내에서 계수와 형태를 변형하여 매번 새로운 문제를 창조합니다.
-   **Strict Grading Engine**: `log|x| + C`와 같은 미세한 수학적 표기까지 잡아내는 초정밀 채점 로직을 탑재했습니다. 특히 **적분상수(C)** 누락 시 가차 없는 피드백을 제공하여 수학적 엄밀성을 훈련시킵니다.
-   **On-Demand Analysis**: 사용자가 해설을 요구하는 즉시, 시스템이 해당 문제만을 위한 맞춤형 단계별 풀이를 생성하여 렌더링합니다.
-   **MathJax Rendering**: 모든 수식은 출판물 수준의 LaTeX 타이포그래피로 렌더링되어 최상의 가독성을 보장합니다.

### 2. Vocabulary Studio
> *기억의 망각 곡선을 정복하다 (Coming Soon)*

단순한 단어 암기를 넘어, 인지과학적 접근을 시도하는 어휘 관리 모듈입니다. 자동화된 오답 노트 시스템과 스마트 셔플 알고리즘을 통해 효율적인 암기 학습을 지원할 예정입니다.

### 3. Compiler Studio
> *브라우저, 그 이상의 개발 환경 (Coming Soon)*

설치 없는 코딩, 언제 어디서나 가능한 알고리즘 트레이닝을 목표로 하는 웹 IDE입니다. C/C++ 코드를 브라우저에서 즉시 작성하고 실행할 수 있는 무설치 환경을 제공합니다.

---

## 디자인 시스템

ISHS_Lab의 인터페이스는 심미적 만족감과 기능적 효율성을 동시에 추구합니다.

-   **Deep Black Dark Mode**: OLED 디스플레이에 최적화된 `#0a0a0a` 베이스의 다크 모드는 눈의 피로를 최소화하고 콘텐츠의 몰입도를 극대화합니다.
-   **Responsive Fluid Layout**: 데스크탑 워크스테이션부터 태블릿, 모바일에 이르기까지, 단 하나의 픽셀도 낭비하지 않는 유동적 그리드 시스템이 적용되었습니다.

---

## 기술 스택

본 프로젝트는 안정성과 최신 기술의 조화를 위해 다음과 같은 기술 스택으로 구축되었습니다.

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Semantic HTML, CSS Variables, ES6+ Vanilla JS |
| **Backend** | ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white) | Server-side Rendering & Logic Processing |
| **Math Engine** | ![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=flat-square&logo=python&logoColor=white) ![SymPy](https://img.shields.io/badge/SymPy-Mathematics-3776AB?style=flat-square) | Symbolic Mathematics, Dynamic Calculus Generation |
| **Rendering** | **MathJax** | Professional LaTeX Typesetting |

---

## 설치 및 실행

ISHS_Lab을 로컬 환경에 배포하기 위한 절차입니다.

### Prerequisites
- PHP 7.4 이상이 구동되는 웹 서버 (Apache/Nginx)
- Python 3.8 이상 (SymPy 라이브러리 필수)
- `pip install sympy`

### Installation
1. 레포지토리를 웹 서버의 루트 디렉토리에 복제합니다.
2. `integral.php` 및 기타 PHP 파일의 권한을 확인합니다.
3. 웹 브라우저를 통해 `index.php`에 접속합니다.

---

## 라이선스

- **Developer**: Dohye Lee (ISHS 32nd)
- **Copyright**: © 2026 ISHS_Lab. All Rights Reserved.
- **License**: MIT License

---
*Created with passion, driven by calculus.*
