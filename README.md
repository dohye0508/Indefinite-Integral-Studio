# ISHS_Lab 🧪
> **Integrated Academic Platform**
> *수학, 언어, 공학을 아우르는 통합 학습 환경*

![Status](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-2.5.0_Integb-blue) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🏛️ 프로젝트 개요

**ISHS_Lab**은 사용자 경험(UX)과 학습 효율성에 초점을 맞춘 웹 기반 통합 학술 플랫폼입니다.
**Integral Studio**를 시작으로 수학적 연산, 어휘 관리, 프로그래밍 실습 환경을 하나의 통합된 인터페이스로 제공하는 것을 목표로 합니다. 직관적인 UI 설계와 견고한 백엔드 로직을 통해 실질적인 학습 가치를 제공합니다.

---

## 💎 핵심 모듈

현재 **Integral Studio**가 메인 서비스로 운영되고 있으며, 어휘 및 컴파일러 모듈이 순차적으로 통합될 예정입니다.

### 1. 📐 Integral Studio (Indefinite Integral Training)
**Python SymPy** 엔진 기반의 부정적분 문제 생성 및 검증 시스템입니다.

-   **Dynamic Problem Generation**: 사전에 정의된 문제 유형 내에서 계수와 구조를 동적으로 변형하여 매번 새로운 문제를 생성합니다.
-   **Strict Grading Engine**: 부정적분의 필수 요소인 **적분상수(C)** 포함 여부를 엄격하게 검증하며, 로그 함수의 절대값 표기(`log|x|`) 등 정밀한 수식 채점을 수행합니다.
-   **Step-by-Step Analysis**: 문제 풀이 요청 시, 백엔드 엔진이 해당 문제의 풀이 과정을 단계별로 생성하여 제공합니다.
-   **MathJax Rendering**: LaTeX 기반의 고품질 수식 렌더링을 지원합니다.

### 2. 📝 Vocabulary Studio (Planned)
효율적인 어휘 암기 및 관리를 위한 학습 도구입니다.

-   **Auto-TTS Integration**: 단어 및 예문 음성 합성 기능 제공 예정
-   **Adaptive Learning**: 오답 데이터를 기반으로 한 개인화된 단어 노출 알고리즘 적용

### 3. 💻 Compiler Studio (Planned)
웹 브라우저 기반의 경량 C/C++ 통합 개발 환경(IDE)입니다.

-   **Web-Based Execution**: 별도의 로컬 환경 설정 없이 코드 작성 및 실행 가능
-   **Standard Options**: GCC 표준 최적화 옵션(-O2 등) 지원 예정

---

## 🛠 기술 스택

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Semantic HTML, CSS Variables, ES6+ Vanilla JS |
| **Backend** | ![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white) | Server-side Rendering & Logic Processing |
| **Math Engine** | ![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=flat-square&logo=python&logoColor=white) ![SymPy](https://img.shields.io/badge/SymPy-Mathematics-3776AB?style=flat-square) | Symbolic Mathematics, Dynamic Calculus Generation |
| **Rendering** | **MathJax** | Professional LaTeX Typesetting |

---

## 📜 라이선스

- **Developer**: Dohye Lee
- **Copyright**: © 2026 ISHS_Lab. All Rights Reserved.
- **License**: MIT License
