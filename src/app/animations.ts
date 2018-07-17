import { animate, animation, style, keyframes } from "@angular/animations";

export var fadeInAnimation = animation([
  style({
    opacity: "{{ from }}",
    transform: "translateX({{startingPoint}})"
  }),
  animate(
    "{{ duration }} {{ delay }} ease-in-out",
    style({
      opacity: "{{ to }}",
      transform: "translateX({{endingPoint}})"
    })
  )
]);
