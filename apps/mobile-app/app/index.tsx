import { Text, VStack } from "@/components";

/**
 * Scaffold blank slate. Auth UI and product surfaces land with screen
 * design and Linear tickets — not at workshop scaffold.
 */
const IndexRoute = () => {
  return (
    <VStack className="flex-1 justify-center gap-4 bg-page px-6">
      <Text className="font-display-bold text-3xl text-text">Kindred</Text>
      <Text className="font-app-regular text-base text-text/60">
        Patronage app for rising African artists. Fans support artists with a
        monthly subscription routed to the artists they choose.
      </Text>
    </VStack>
  );
};

export default IndexRoute;
