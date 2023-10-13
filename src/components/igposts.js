//React component will show the returned posts

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Image,
  Grid,
  GridItem,
  Stack,
  Link,
} from "@chakra-ui/react";

export default function PostList(props) {
  let posts = props.posts;
  //console.log(posts)
  if (posts.length > 0) {
    // convert every post.takenAt epoch to a human readable date
    posts = posts.filter((item, index) => {
      //example date is 1691415664
      //convert this epoch to a readable date
      if (item && item.post) {
        let utcseconds = item.post.taken_at;
        //console.log(utcseconds)
        let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcseconds);
        item.post.takenAt = d.toLocaleString();

        return item;
      }
    });
  }

  return (
    <Box pt={"100px"}>
      <Grid templateColumns="repeat(4, 1fr)" gap={"20"}>
        {/** Create GridItem for each post that has the background image and has inner text centered at the bottom of the Box */}
        {posts.map((item, index) => (
          <GridItem border={"1px solid white"} w="100%" h="60" m={2}>
            <Box
              pos={"relative"}
              borderRadius={"20px"}
              key={index}
              height="100%"
              bgRepeat={"none"}
              textAlign={"center"}
            >
              <Image
                width={"100%"}
                src={item.image.screenshot.url}
                alt={item.name}
              />
              {/** Box will contain item.post.caption.text Text */}
              <Box
                pos={"absolute"}
                top={"190px"}
                bg={"#00000057"}
                textAlign={"left"}
                w={"100%"}
                pl={"5px"}
              >
                {/** display the caption text as the first line truncated and adding ... */}
                <Text noOfLines={[1, 2]}>
                  {item.post.caption ? item.post.caption.text : ""}
                </Text>
              </Box>
              {/** Box will contain the profile image displayed as a circle to the top left of the parent */}
              <Box
                pos={"absolute"}
                top={"-55px"}
                left={"0px"}
                overflow={"hidden"}
              >
                <Stack direction={"row"}>
                  <Box>
                    <Image
                      border={"1px solid white"}
                      w={"50px"}
                      h={"50px"}
                      borderRadius={"50%"}
                      src={item.profile_image.screenshot.url}
                      alt={item.post.user.username}
                    />
                  </Box>
                  <Box textAlign={"left"} w={"250px"}>
                    <Stack>
                      <Box>
                        <Link href={item.profile_stats.url} isExternal>
                          <Text as={"b"} color={"white"}>
                            {item.post.user.username}
                          </Text>
                        </Link>
                      </Box>
                      <Box pos={"relative"} mt={"-10px"}>
                        {/* display the followersCount as the second line in a pretty format replacing thousands with K and millions with M and adding commas */}
                        <Text color={"white"}>
                          {item.profile_stats.followersCount.toLocaleString(
                            "en-US",
                          )}{" "}
                          followers
                        </Text>{" "}
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
              <Text mt={"5px"} float={"right"} fontSize={"xs"}>
                {item.post.takenAt}
              </Text>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}
