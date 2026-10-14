import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: { alt: string; src: unknown }) => <img alt={props.alt} src={typeof props.src === "string" ? props.src : ""} />,
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { experienceStore, TIMINGS } from "@/lib/experience-store";
import { getProject, projects } from "@/lib/project-data";
import { ProjectCaseStudy } from "./projection/ProjectCaseStudy";
import { AccessibleControls } from "./accessibility/AccessibleControls";
import { StaticPortfolioFallback } from "./accessibility/StaticPortfolioFallback";

beforeEach(() => {
  vi.useFakeTimers();
  experienceStore.setState({ projectorState: "off", transition: null, reducedMotion: false });
  experienceStore.getState().powerOn();
  act(() => vi.advanceTimersByTime(TIMINGS.warm + TIMINGS.focus + 10));
});

describe("case study", () => {
  it("switches focus layers with arrow keys (tabs twin of the focus wheel)", () => {
    act(() => experienceStore.getState().hydrateRoute({ section: "work", project: "asi1", view: "product", frame: null }));
    const p = getProject("asi1")!;
    render(<ProjectCaseStudy project={p} index={0} total={projects.length} prev={projects[4]} next={projects[1]} />);
    expect(screen.getByRole("tab", { name: /product/i })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(experienceStore.getState().activeProjectView).toBe("architecture");
    // the FocusDriver tween is not mounted here; jump the wheel to its target
    act(() => experienceStore.setState({ focusValue: experienceStore.getState().focusTarget }));
    expect(screen.getByRole("tab", { name: /architecture/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("img", { name: /architecture of asi1/i })).toBeInTheDocument();
  });

  it("labels confidential work and shows no product screenshot", () => {
    act(() => experienceStore.getState().hydrateRoute({ section: "work", project: "jasper-ops", view: "product", frame: null }));
    const p = getProject("jasper-ops")!;
    render(<ProjectCaseStudy project={p} index={2} total={5} prev={projects[1]} next={projects[3]} />);
    expect(screen.getByText("Confidential")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /abstract cover/i })).toBeInTheDocument();
  });
});

describe("keyboard controls", () => {
  it("navigates sections without a pointer", () => {
    render(<AccessibleControls />);
    fireEvent.click(screen.getByRole("link", { name: "Contact" }), { button: 0 });
    expect(experienceStore.getState().activeSection).toBe("contact");
    expect(experienceStore.getState().projectorState).toBe("changing-slide");
  });

  it("powers the projector off and on", () => {
    render(<AccessibleControls />);
    fireEvent.click(screen.getByRole("button", { name: "Power off" }));
    expect(experienceStore.getState().projectorState).toBe("cooling");
  });
});

describe("static fallback", () => {
  it("explains the static mode to assistive tech", () => {
    render(<StaticPortfolioFallback />);
    expect(screen.getByText(/static portfolio/i)).toBeInTheDocument();
  });
});
