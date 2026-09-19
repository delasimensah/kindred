import { Text, VStack } from "@/components";

/**
 * Scaffold blank slate. Auth UI and product surfaces land with screen
 * design and Linear tickets — not at workshop scaffold.
 */
const IndexRoute = () => {
  return (
    <VStack className="flex-1 justify-center gap-4 px-6">
      <Text className="text-3xl font-semibold">Kindred</Text>
      <Text className="text-base text-grey">
        Patronage app for rising African artists. Fans support artists with a
        monthly subscription routed to the artists they choose.
      </Text>
    </VStack>
  );
};

export default IndexRoute;
