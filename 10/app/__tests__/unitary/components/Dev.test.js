import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';

import factory from '../../utils/factory';
import { Dev } from '~/components/Dev';

describe('Dev component', () => {
  it('should be able to create a map marker', async () => {
    const dev = await factory.attrs('Developer');
    const { getByText, getByTestId } = render(
      <Dev testID="marker" dev={dev} navigation={{ navigate: jest.fn() }} />
    );

    expect(getByTestId('avatar')).toHaveProp('source', {
      uri: dev.avatar_url,
    });
    expect(getByText(dev.name)).toBeTruthy();
    expect(getByText(dev.bio)).toBeTruthy();
    expect(getByText(dev.techs.join(', '))).toBeTruthy();
  });

  it('should be able to navigate to user profile', async () => {
    const dev = await factory.attrs('Developer');
    const navigate = jest.fn();

    const { getByTestId } = render(<Dev dev={dev} navigation={{ navigate }} />);

    fireEvent.press(getByTestId('profile'));

    expect(navigate).toHaveBeenCalledWith('Profile', {
      github_username: dev.github_username,
    });
  });
});