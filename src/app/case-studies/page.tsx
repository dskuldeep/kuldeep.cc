import { permanentRedirect } from "next/navigation";

export default function CaseStudiesRedirect() {
  permanentRedirect("/projects");
}
